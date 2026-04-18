import { describe, it, expect } from "vitest";
import { chatReducer, initialState, WELCOME_MESSAGE } from "@/hooks/useChat";
import type { ChatMessage, ChatState } from "@/types";

describe("chatReducer", () => {
  it("硬编码欢迎语应是开放式引导，不带开场选项卡", () => {
    expect(WELCOME_MESSAGE.content).toContain("需求探索师");
    expect(WELCOME_MESSAGE.content).toContain("一句话");
    expect(WELCOME_MESSAGE.choices).toBeUndefined();
  });

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
            id: "u0",
            role: "user",
            content: "我想做一个后台管理功能",
            timestamp: Date.now(),
          },
          {
            id: "a0",
            role: "assistant",
            content: "明白，我先确认目标用户。",
            isStreaming: false,
            timestamp: Date.now(),
          },
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
      expect(next.messages[2].isStreaming).toBe(false);
      expect(next.messages[2].choices).toHaveLength(2);
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
        toolArgs: { stage: "generate_solution", prototype_html: html },
      });

      expect(next.prototypeHtml).toBe(html);
    });

    it("早期 stage（understand_background）即使传了合法 HTML 也应丢弃", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "我想画个粗略线框看看，可以吗？",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const html = "<!DOCTYPE html><html><body>早期原型</body></html>";
      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "understand_background",
          prototype_html: html,
        },
      });

      expect(next.prototypeHtml).toBeNull();
      expect(next.currentStage).toBe("understand_background");
    });

    it("早期 stage（scope_splitting）即使传了合法 HTML 也应丢弃", () => {
      const state: ChatState = {
        ...initialState,
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

      const html = "<!DOCTYPE html><html><body>线框</body></html>";
      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "scope_splitting",
          prototype_html: html,
        },
      });

      expect(next.prototypeHtml).toBeNull();
    });

    it("clarify_requirements 及以后阶段允许 prototype_html（非早期 stage）", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "这是粗略线框",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const html = "<!DOCTYPE html><html><body>线框</body></html>";
      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "clarify_requirements",
          prototype_html: html,
        },
      });

      expect(next.prototypeHtml).toBe(html);
    });

    it("如果助手文字是在询问是否画原型，同轮应丢弃 prototype_html", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "u1",
            role: "user",
            content: "销售数据大屏，需要排行、折线图和指标卡片",
            timestamp: Date.now(),
          },
          {
            id: "a1",
            role: "assistant",
            content: "我先确认一下范围。如果你愿意，我下一轮直接给你出一版大屏布局草图。",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const html = "<!DOCTYPE html><html><body>不应同轮出现</body></html>";
      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "generate_solution",
          prototype_html: html,
        },
      });

      expect(next.prototypeHtml).toBeNull();
    });

    it("用户明确同意画原型后应允许 prototype_html", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "u1",
            role: "user",
            content: "可以，画一下原型",
            timestamp: Date.now(),
          },
          {
            id: "a1",
            role: "assistant",
            content: "这是后台大屏的一版粗略线框。",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const html = "<!DOCTYPE html><html><body>同意后的原型</body></html>";
      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "generate_solution",
          prototype_html: html,
        },
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

    it("requirements_summary 在非 summary stage 应被丢弃", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "再澄清一下",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "clarify_requirements",
          requirements_summary: "# 需求文档\n提前写的摘要",
        },
      });

      expect(next.requirementsSummary).toBeNull();
    });

    it("requirements_summary 在 confirm_convergence 阶段应被接受", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "给你看一版整理",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const summary = "# 需求文档\n草案";
      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "confirm_convergence",
          requirements_summary: summary,
        },
      });

      expect(next.requirementsSummary).toBe(summary);
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

    it("空 content + choices 时应丢弃 choices（防止空气泡 + 菜单）", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
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

      expect(next.messages[0].choices).toBeUndefined();
      expect(next.messages[0].isStreaming).toBe(false);
    });

    it("content 仅为空白字符时应丢弃 choices", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "   \n\t  ",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          choices: [
            { id: "x", label: "X" },
            { id: "y", label: "Y" },
          ],
        },
      });

      expect(next.messages[0].choices).toBeUndefined();
    });

    it("应过滤掉\"其他（请描述）\"类兜底选项", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "u0",
            role: "user",
            content: "我想做司机卡管理",
            timestamp: Date.now(),
          },
          {
            id: "a0",
            role: "assistant",
            content: "明白，这是后台管理方向。",
            isStreaming: false,
            timestamp: Date.now(),
          },
          {
            id: "a1",
            role: "assistant",
            content: "你想先做哪个？",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "scope_splitting",
          choices: [
            { id: "a", label: "司机管理" },
            { id: "b", label: "车辆管理" },
            { id: "c", label: "其他（请描述）" },
            { id: "d", label: "其他" },
          ],
        },
      });

      expect(next.messages[2].choices).toHaveLength(2);
      expect(next.messages[2].choices?.map((c) => c.id)).toEqual(["a", "b"]);
    });

    it("过滤兜底项后剩余 < 2 时整个清空 choices", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "你想做什么？",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          choices: [
            { id: "a", label: "司机管理" },
            { id: "b", label: "其他（请描述）" },
          ],
        },
      });

      expect(next.messages[0].choices).toBeUndefined();
    });

    it("第一轮真实助手回复应丢弃 choices，先自然承接用户第一句话", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "initial-welcome",
            role: "assistant",
            content: "欢迎！我是需求探索师。",
            isInitial: true,
            timestamp: 0,
          },
          {
            id: "u1",
            role: "user",
            content: "我想做一个司机卡管理的功能",
            timestamp: Date.now(),
          },
          {
            id: "a1",
            role: "assistant",
            content: "明白，你想做的是司机卡管理。先确认一个关键边界：这是后台管理员维护，还是司机自己操作？",
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
            { id: "admin", label: "后台管理员" },
            { id: "driver", label: "司机自己" },
          ],
        },
      });

      expect(next.messages[2].choices).toBeUndefined();
    });

    it("含\"其他\"二字但非兜底命名的选项不应被过滤（防误伤）", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "u0",
            role: "user",
            content: "我想做系统接入",
            timestamp: Date.now(),
          },
          {
            id: "a0",
            role: "assistant",
            content: "明白，我先确认接入对象。",
            isStreaming: false,
            timestamp: Date.now(),
          },
          {
            id: "a1",
            role: "assistant",
            content: "你想接入哪个？",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          choices: [
            { id: "a", label: "自建系统" },
            { id: "b", label: "其他系统接入" },
          ],
        },
      });

      expect(next.messages[2].choices).toHaveLength(2);
      expect(next.messages[2].choices?.map((c) => c.label)).toEqual([
        "自建系统",
        "其他系统接入",
      ]);
    });

    it("用户纠错后的下一轮应丢弃 choices，先自然修正理解", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "u1",
            role: "user",
            content: "不对，不要司机端，只做后台管理",
            timestamp: Date.now(),
          },
          {
            id: "a1",
            role: "assistant",
            content: "明白，我刚才把对象理解偏了。这里收敛为后台管理员维护司机卡 ID。",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "clarify_requirements",
          choices: [
            { id: "bind", label: "绑定解绑为主" },
            { id: "card", label: "还要管卡 ID 本身" },
          ],
        },
      });

      expect(next.messages[1].choices).toBeUndefined();
    });

    it("输出需求文档时应丢弃 choices，避免最终结果夹带空菜单", () => {
      const state: ChatState = {
        ...initialState,
        isLoading: true,
        messages: [
          {
            id: "a1",
            role: "assistant",
            content: "我先把当前需求整理成一版文档。",
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      };

      const summary = "# 需求文档\n## 1. 背景\n后台管理司机卡 ID";
      const next = chatReducer(state, {
        type: "FINISH_ASSISTANT_MESSAGE",
        id: "a1",
        toolArgs: {
          stage: "output_result",
          requirements_summary: summary,
          choices: [
            { id: "a", label: "A ?" },
            { id: "b", label: "B ?" },
          ],
        },
      });

      expect(next.requirementsSummary).toBe(summary);
      expect(next.messages[0].choices).toBeUndefined();
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
