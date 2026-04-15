import { describe, it, expect } from "vitest";
import { buildApiMessages } from "@/hooks/useChat";
import type { ChatMessage } from "@/types";

describe("buildApiMessages", () => {
  it("应将纯文本消息转为简单格式", () => {
    const messages: ChatMessage[] = [
      {
        id: "u1",
        role: "user",
        content: "我想做一个请假系统",
        timestamp: Date.now(),
      },
      {
        id: "a1",
        role: "assistant",
        content: "好的，我来帮你梳理",
        timestamp: Date.now(),
      },
    ];

    const result = buildApiMessages(messages);

    expect(result).toEqual([
      { role: "user", content: "我想做一个请假系统" },
      { role: "assistant", content: "好的，我来帮你梳理" },
    ]);
  });

  it("应将带图片的用户消息转为多模态格式", () => {
    const messages: ChatMessage[] = [
      {
        id: "u1",
        role: "user",
        content: "这是现有页面",
        imageUrl: "data:image/png;base64,abc123",
        timestamp: Date.now(),
      },
    ];

    const result = buildApiMessages(messages);

    expect(result).toEqual([
      {
        role: "user",
        content: [
          { type: "text", text: "这是现有页面" },
          {
            type: "image_url",
            image_url: { url: "data:image/png;base64,abc123", detail: "high" },
          },
        ],
      },
    ]);
  });

  it("应混合处理有图片和无图片的消息", () => {
    const messages: ChatMessage[] = [
      {
        id: "u1",
        role: "user",
        content: "看看这个",
        imageUrl: "data:image/jpeg;base64,xyz",
        timestamp: Date.now(),
      },
      {
        id: "a1",
        role: "assistant",
        content: "我看到了一个表格页面",
        timestamp: Date.now(),
      },
      {
        id: "u2",
        role: "user",
        content: "对，我想改造它",
        timestamp: Date.now(),
      },
    ];

    const result = buildApiMessages(messages);

    expect(result).toHaveLength(3);
    expect(Array.isArray(result[0].content)).toBe(true);
    expect(typeof result[1].content).toBe("string");
    expect(typeof result[2].content).toBe("string");
  });

  it("应正确处理空消息列表", () => {
    const result = buildApiMessages([]);
    expect(result).toEqual([]);
  });

  it("不应包含 choices 等前端特有字段", () => {
    const messages: ChatMessage[] = [
      {
        id: "a1",
        role: "assistant",
        content: "请选择",
        choices: [{ id: "a", label: "选项A" }],
        isStreaming: false,
        timestamp: Date.now(),
      },
    ];

    const result = buildApiMessages(messages);
    const apiMsg = result[0] as Record<string, unknown>;

    expect(apiMsg).not.toHaveProperty("choices");
    expect(apiMsg).not.toHaveProperty("isStreaming");
    expect(apiMsg).not.toHaveProperty("id");
    expect(apiMsg).not.toHaveProperty("timestamp");
  });
});
