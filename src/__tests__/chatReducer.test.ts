import { describe, it, expect } from "vitest";
import { chatReducer, initialState } from "@/hooks/useChat";
import type { ChatMessage, ChatState } from "@/types";

describe("chatReducer", () => {
  describe("ADD_USER_MESSAGE", () => {
    it("应追加用户消息并设置 isLoading=true", () => {
      const msg: ChatMessage = {
        id: "u1",
        role: "user",
        content: "我想做一个请假系统",
        timestamp: Date.now(),
      };

      const next = chatReducer(initialState, {
        type: "ADD_USER_MESSAGE",
        message: msg,
      });

      expect(next.messages).toHaveLength(1);
      expect(next.messages[0].content).toBe("我想做一个请假系统");
      expect(next.isLoading).toBe(true);
      expect(next.error).toBeNull();
    });

    it("应清除之前的错误", () => {
      const stateWithError: ChatState = {
        ...initialState,
        error: "some error",
      };

      const msg: ChatMessage = {
        id: "u2",
        role: "user",
        content: "test",
        timestamp: Date.now(),
      };

      const next = chatReducer(stateWithError, {
        type: "ADD_USER_MESSAGE",
        message: msg,
      });

      expect(next.error).toBeNull();
    });
  });

  describe("START_ASSISTANT_MESSAGE", () => {
    it("应创建空的助手消息占位并设置 isStreaming=true", () => {
      const next = chatReducer(initialState, {
        type: "START_ASSISTANT_MESSAGE",
        id: "a1",
      });

      expect(next.messages).toHaveLength(1);
      expect(next.messages[0].id).toBe("a1");
      expect(next.messages[0].role).toBe("assistant");
      expect(next.messages[0].content).toBe("");
      expect(next.messages[0].isStreaming).toBe(true);
    });
  });

  describe("APPEND_TEXT_DELTA", () => {
    it("应追加文字到对应消息", () => {
      const state: ChatState = {
        ...initialState,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "你好",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "APPEND_TEXT_DELTA",
        id: "a1",
        delta: "，我是需求探索师",
      });

      expect(next.messages[0].content).toBe("你好，我是需求探索师");
    });

    it("不应修改其他消息", () => {
      const state: ChatState = {
        ...initialState,
        messages: [
          { id: "u1", role: "user", content: "hello", timestamp: Date.now() },
          {
            id: "a1",
            role: "assistant",
            content: "",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "APPEND_TEXT_DELTA",
        id: "a1",
        delta: "hi",
      });

      expect(next.messages[0].content).toBe("hello");
      expect(next.messages[1].content).toBe("hi");
    });
  });

  describe("FINISH_ASSISTANT_MESSAGE", () => {
    it("应停止流式、附加 choices 并更新 stage", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "请问您想做什么？",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "understand_background",
          choices: [
            { id: "new", label: "全新功能" },
            { id: "improve", label: "改造现有功能" },
          ],
        },
      });

      expect(next.isLoading).toBe(false);
      expect(next.messages[0].isStreaming).toBe(false);
      expect(next.messages[0].choices).toHaveLength(2);
      expect(next.currentStage).toBe("understand_background");
    });

    it("应更新 prototypeHtml 当 toolArgs 包含时", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "这是原型",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const html = "<html><body>原型</body></html>";
      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "generate_solution",
          prototype_html: html,
        },
      });

      expect(next.prototypeHtml).toBe(html);
      expect(next.currentStage).toBe("generate_solution");
    });

    it("应拒绝非法 prototype_html（非完整 HTML 文档）", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "看看这个",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "understand_background",
          // 对话文字被误塞进 prototype_html
          prototype_html: "请问您想要做什么？",
        },
      });

      expect(next.prototypeHtml).toBeNull();
    });

    it("应接受 <!DOCTYPE 开头的完整 HTML", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "原型",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const html = "<!DOCTYPE html><html lang=\"zh-CN\"><body>原型</body></html>";
      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: { prototype_html: html },
      });

      expect(next.prototypeHtml).toBe(html);
    });

    it("不传 prototype_html 时不应覆盖已有原型", () => {
      const existingHtml = "<html><body>旧原型</body></html>";
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        prototypeHtml: existingHtml,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "继续对话",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: { stage: "clarify_requirements" },
      });

      expect(next.prototypeHtml).toBe(existingHtml);
    });

    it("应更新 requirementsSummary", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "完成",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const summary = "# 需求文档\n## 概述\n...";
      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "output_result",
          requirements_summary: summary,
        },
      });

      expect(next.requirementsSummary).toBe(summary);
      expect(next.currentStage).toBe("output_result");
    });

    it("不传 stage 时不应改变当前阶段", () => {
      const state: ChatState = {
        ...initialState,
        currentStage: "clarify_requirements",
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "ok",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {},
      });

      expect(next.currentStage).toBe("clarify_requirements");
    });
  });

  describe("SET_ERROR / CLEAR_ERROR", () => {
    it("SET_ERROR 应设置错误并停止加载", () => {
      const state: ChatState = { ...initialState, isLoading: true };
      const next = chatReducer(state, {
        type: "SET_ERROR",
        error: "网络错误",
      });

      expect(next.error).toBe("网络错误");
      expect(next.isLoading).toBe(false);
    });

    it("CLEAR_ERROR 应清除错误", () => {
      const state: ChatState = { ...initialState, error: "some error" };
      const next = chatReducer(state, { type: "CLEAR_ERROR" });
      expect(next.error).toBeNull();
    });
  });

  describe("unknown action", () => {
    it("应返回原始状态", () => {
      // @ts-expect-error testing unknown action
      const next = chatReducer(initialState, { type: "UNKNOWN" });
      expect(next).toBe(initialState);
    });
  });
});
