"use client";

import { useReducer, useCallback, useRef } from "react";
import type {
  ChatMessage,
  ChatState,
  Choice,
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
    "欢迎！我是**需求探索师**。\n\n直接用一句话告诉我你想做的功能、流程或问题；如果是在改造现有页面，也可以把截图一起发来。\n\n我会先听懂你的想法，再一步步帮你澄清边界、流程和关键取舍。",
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

// "其他（请描述）"类兜底项 — UI 已有自由输入入口，choices 不应再列。
// 严格匹配避免误伤"其他系统接入"等合理选项。
function isFallbackChoice(choice: Choice): boolean {
  const label = choice.label.trim();
  return (
    label === "其他" ||
    label === "其它" ||
    label.startsWith("其他（") ||
    label.startsWith("其它（")
  );
}

function getPreviousUserContent(
  messages: ChatMessage[],
  assistantId: string,
): string {
  const assistantIndex = messages.findIndex((m) => m.id === assistantId);
  if (assistantIndex <= 0) return "";

  for (let i = assistantIndex - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }

  return "";
}

function getMessageContent(messages: ChatMessage[], id: string): string {
  return messages.find((m) => m.id === id)?.content ?? "";
}

function isFirstRealAssistantReply(
  messages: ChatMessage[],
  assistantId: string,
): boolean {
  const assistantIndex = messages.findIndex((m) => m.id === assistantId);
  if (assistantIndex < 0) return false;

  return !messages
    .slice(0, assistantIndex)
    .some((m) => m.role === "assistant" && !m.isInitial);
}

// 用户在纠正边界、对象或方向时，下一轮应先自然修正理解，不再补菜单。
function isCorrectionMessage(content: string): boolean {
  return /不对|不是这个|不是这个意思|我说的是|我说清楚|纠正|理解错|理解偏|你理解错|不要|不需要|不用|别/.test(
    content,
  );
}

function isPrototypeConsent(content: string): boolean {
  return /(可以|好|行|嗯|直接|马上|现在).*(画|出|生成|做|给|看).*(原型|线框|草图|布局|界面|页面|样子)|(?:画一下|画个|出一版|生成原型|给我看|看看样子|做个原型|直接画|直接出|直接生成|直接做)/.test(
    content,
  );
}

function isPrototypeOffer(content: string): boolean {
  const hasVisualTerm = /原型|线框|草图|布局|画|可视化|界面|页面|大概样子/.test(
    content,
  );
  const hasOfferTerm =
    /如果你愿意|要不要|是否|可以.*吗|我可以|我先不直接|下一轮|先.*画|需要.*画/.test(
      content,
    );
  return hasVisualTerm && hasOfferTerm;
}

const EARLY_STAGES = new Set(["understand_background", "scope_splitting"]);
const SUMMARY_STAGES = new Set(["confirm_convergence", "output_result"]);

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
      const assistantContent = getMessageContent(state.messages, action.id);
      const previousUserContent = getPreviousUserContent(
        state.messages,
        action.id,
      );
      const targetStage = toolArgs.stage ?? state.currentStage;
      const incomingSummary = toolArgs.requirements_summary?.trim();
      const firstRealAssistantReply = isFirstRealAssistantReply(
        state.messages,
        action.id,
      );
      const filteredChoices = toolArgs.choices
        ?.filter((c) => !isFallbackChoice(c));
      let effectiveChoices = filteredChoices;
      if (filteredChoices && filteredChoices.length < 2) {
        if (toolArgs.choices && toolArgs.choices.length > 0) {
          console.warn(
            "[brainstorm] fallback: choices < 2 after filter, dropping",
          );
        }
        effectiveChoices = undefined;
      }

      const dropChoicesForCorrection = isCorrectionMessage(previousUserContent);
      const dropChoicesForFinal =
        targetStage === "output_result" || !!incomingSummary;
      if (
        effectiveChoices &&
        (firstRealAssistantReply ||
          dropChoicesForCorrection ||
          dropChoicesForFinal)
      ) {
        console.warn(
          "[brainstorm] drop: choices in first/correction/final response",
        );
        effectiveChoices = undefined;
      }

      const hasValidPrototype = isValidPrototypeHtml(toolArgs.prototype_html);
      // 早期 stage 禁止未经用户同意就生成原型 —— 硬丢弃，防止"AI 先入为主"
      const dropPrototypeEarlyStage =
        hasValidPrototype && EARLY_STAGES.has(targetStage);
      if (dropPrototypeEarlyStage) {
        console.warn(
          "[brainstorm] drop: prototype_html in early stage:",
          targetStage,
        );
      }
      const dropPrototypeOffer =
        hasValidPrototype &&
        isPrototypeOffer(assistantContent) &&
        !isPrototypeConsent(previousUserContent);
      if (dropPrototypeOffer) {
        console.warn("[brainstorm] drop: prototype_html while offering first");
      }
      // 需求摘要只在 confirm_convergence / output_result 阶段接受，防止前段提前渲染最终文档
      const dropSummaryEarly =
        !!incomingSummary && !SUMMARY_STAGES.has(targetStage);
      if (dropSummaryEarly) {
        console.warn(
          "[brainstorm] drop: requirements_summary at stage:",
          targetStage,
        );
      }

      return {
        ...state,
        isLoading: false,
        messages: state.messages.map((m) => {
          if (m.id !== action.id) return m;
          const renderable = isRenderableChoices(effectiveChoices, m.content);
          if (m.content.trim() === "") {
            if (effectiveChoices && effectiveChoices.length > 0) {
              console.warn(
                "[brainstorm] fallback: drop choices on empty assistant content",
              );
            }
            if (hasValidPrototype) {
              console.warn(
                "[brainstorm] fallback: prototype updated without assistant text",
              );
            }
          }
          return {
            ...m,
            isStreaming: false,
            choices: renderable ? effectiveChoices : undefined,
          };
        }),
        currentStage: targetStage,
        prototypeHtml:
          hasValidPrototype && !dropPrototypeEarlyStage && !dropPrototypeOffer
            ? toolArgs.prototype_html!
            : state.prototypeHtml,
        requirementsSummary:
          incomingSummary && !dropSummaryEarly
            ? toolArgs.requirements_summary!
            : state.requirementsSummary,
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
