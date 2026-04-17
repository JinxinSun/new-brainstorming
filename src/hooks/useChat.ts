"use client";

import { useReducer, useCallback, useRef } from "react";
import type {
  ChatMessage,
  ChatState,
  UpdateInterfaceArgs,
  ContentPart,
} from "@/types";
import { parseSSEStream } from "@/lib/stream-parser";

// ─── 硬编码开场 ────────────────────────────────────────────
// 首条 AI 欢迎消息由前端直接渲染，不经过 API。
// 目的：避免"自动发送'你好'"污染对话历史、气泡误显示。

export const WELCOME_MESSAGE: ChatMessage = {
  id: "initial-welcome",
  role: "assistant",
  content:
    "欢迎！我是**需求探索师**。\n\n我会通过对话帮你把模糊的想法一步步梳理清楚，过程中会在右侧实时生成原型辅助理解，最终输出一份清晰的需求文档。\n\n**请问您想要做的是？**",
  choices: [
    { id: "new", label: "全新的功能或页面" },
    { id: "improve", label: "改造现有的功能" },
    { id: "other", label: "其他（请直接描述您的想法）" },
  ],
  timestamp: 0,
  isInitial: true,
};

// prototype_html 必须是完整 HTML 文档；防止 AI 把对话文字误塞进此字段
function isValidPrototypeHtml(html: string | undefined): html is string {
  if (!html) return false;
  const s = html.trim().toLowerCase();
  return s.startsWith("<!doctype") || s.startsWith("<html");
}

// choices 只在 AI 文字非空时有意义；空文字+choices 会渲染成"空气泡+菜单"
function isRenderableChoices(
  choices: UpdateInterfaceArgs["choices"],
  content: string,
): choices is NonNullable<UpdateInterfaceArgs["choices"]> {
  if (!choices || choices.length === 0) return false;
  return content.trim().length > 0;
}

// ─── Actions ──────────────────────────────────────────────

type Action =
  | { type: "ADD_USER_MESSAGE"; message: ChatMessage }
  | { type: "START_ASSISTANT_MESSAGE"; id: string }
  | { type: "APPEND_TEXT_DELTA"; id: string; delta: string }
  | {
      type: "FINISH_ASSISTANT_MESSAGE";
      id: string;
      toolArgs: UpdateInterfaceArgs;
    }
  | { type: "SET_ERROR"; error: string }
  | { type: "CLEAR_ERROR" };

// ─── Reducer ──────────────────────────────────────────────

export const initialState: ChatState = {
  messages: [],
  currentStage: "understand_background",
  prototypeHtml: null,
  requirementsSummary: null,
  isLoading: false,
  error: null,
};

export function chatReducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case "ADD_USER_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.message],
        isLoading: true,
        error: null,
      };

    case "START_ASSISTANT_MESSAGE":
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: action.id,
            role: "assistant",
            content: "",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

    case "APPEND_TEXT_DELTA":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id
            ? { ...m, content: m.content + action.delta }
            : m,
        ),
      };

    case "FINISH_ASSISTANT_MESSAGE": {
      const { toolArgs } = action;
      return {
        ...state,
        isLoading: false,
        messages: state.messages.map((m) => {
          if (m.id !== action.id) return m;
          const renderable = isRenderableChoices(toolArgs.choices, m.content);
          if (m.content.trim() === "") {
            if (toolArgs.choices && toolArgs.choices.length > 0) {
              console.warn(
                "[brainstorm] fallback: drop choices on empty assistant content",
              );
            }
            if (isValidPrototypeHtml(toolArgs.prototype_html)) {
              console.warn(
                "[brainstorm] fallback: prototype updated without assistant text",
              );
            }
          }
          return {
            ...m,
            isStreaming: false,
            choices: renderable ? toolArgs.choices : undefined,
          };
        }),
        currentStage: toolArgs.stage ?? state.currentStage,
        prototypeHtml: isValidPrototypeHtml(toolArgs.prototype_html)
          ? toolArgs.prototype_html
          : state.prototypeHtml,
        requirementsSummary:
          toolArgs.requirements_summary ?? state.requirementsSummary,
      };
    }

    case "SET_ERROR":
      return { ...state, isLoading: false, error: action.error };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}

// ─── 构造 API messages ────────────────────────────────────

export function buildApiMessages(
  messages: ChatMessage[],
): Array<{
  role: "user" | "assistant";
  content: string | ContentPart[];
}> {
  return messages
    .filter((m) => !m.isInitial)
    .map((m) => {
      if (m.role === "user" && m.imageUrl) {
        return {
          role: m.role,
          content: [
            { type: "text" as const, text: m.content },
            {
              type: "image_url" as const,
              image_url: { url: m.imageUrl, detail: "high" as const },
            },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });
}

// ─── Hook ─────────────────────────────────────────────────

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, initialState, (s) => ({
    ...s,
    messages: [WELCOME_MESSAGE],
  }));
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string, imageUrl?: string) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        imageUrl,
        timestamp: Date.now(),
      };
      dispatch({ type: "ADD_USER_MESSAGE", message: userMessage });

      const apiMessages = buildApiMessages([...state.messages, userMessage]);

      const assistantId = crypto.randomUUID();
      dispatch({ type: "START_ASSISTANT_MESSAGE", id: assistantId });

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body!.getReader();
        let toolArgs: UpdateInterfaceArgs = {};

        for await (const event of parseSSEStream(reader)) {
          switch (event.type) {
            case "text_delta":
              dispatch({
                type: "APPEND_TEXT_DELTA",
                id: assistantId,
                delta: event.delta,
              });
              break;
            case "tool_call_done":
              toolArgs = event.args;
              break;
            case "error":
              dispatch({ type: "SET_ERROR", error: event.message });
              break;
            case "done":
              dispatch({
                type: "FINISH_ASSISTANT_MESSAGE",
                id: assistantId,
                toolArgs,
              });
              break;
          }
        }
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return;
        const message = err instanceof Error ? err.message : "请求失败";
        dispatch({ type: "SET_ERROR", error: message });
      }
    },
    [state.messages],
  );

  return { state, sendMessage, dispatch };
}
