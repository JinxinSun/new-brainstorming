"use client";

import { useReducer, useCallback, useRef } from "react";
import type {
  ChatMessage,
  ChatState,
  UpdateInterfaceArgs,
  ContentPart,
} from "@/types";
import { parseSSEStream } from "@/lib/stream-parser";

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
        messages: state.messages.map((m) =>
          m.id === action.id
            ? { ...m, isStreaming: false, choices: toolArgs.choices }
            : m,
        ),
        currentStage: toolArgs.stage ?? state.currentStage,
        prototypeHtml: toolArgs.prototype_html ?? state.prototypeHtml,
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
  return messages.map((m) => {
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
  const [state, dispatch] = useReducer(chatReducer, initialState);
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
