import { describe, it, expect } from "vitest";
import { parseSSEStream } from "@/lib/stream-parser";
import type { StreamEvent } from "@/types";

function createMockReader(
  chunks: string[],
): ReadableStreamDefaultReader<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return {
    read: async (): Promise<ReadableStreamReadResult<Uint8Array>> => {
      if (index >= chunks.length) {
        return { done: true, value: undefined } as ReadableStreamReadResult<Uint8Array>;
      }
      const value = encoder.encode(chunks[index++]);
      return { done: false, value };
    },
    cancel: async () => {},
    releaseLock: () => {},
    closed: Promise.resolve(undefined),
  } as ReadableStreamDefaultReader<Uint8Array>;
}

describe("parseSSEStream", () => {
  it("应解析完整的 SSE 事件", async () => {
    const reader = createMockReader([
      'data: {"type":"text_delta","delta":"你好"}\n\n',
      'data: {"type":"done"}\n\n',
    ]);

    const events: StreamEvent[] = [];
    for await (const event of parseSSEStream(reader)) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: "text_delta", delta: "你好" },
      { type: "done" },
    ]);
  });

  it("应处理跨 chunk 的事件", async () => {
    const reader = createMockReader([
      'data: {"type":"text_del',
      'ta","delta":"跨chunk"}\n\ndata: {"type":"done"}\n\n',
    ]);

    const events: StreamEvent[] = [];
    for await (const event of parseSSEStream(reader)) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: "text_delta", delta: "跨chunk" },
      { type: "done" },
    ]);
  });

  it("应解析 tool_call_done 事件", async () => {
    const toolArgs = {
      stage: "understand_background",
      choices: [
        { id: "new", label: "全新功能" },
        { id: "improve", label: "改造现有功能" },
      ],
    };

    const reader = createMockReader([
      `data: {"type":"tool_call_done","args":${JSON.stringify(toolArgs)}}\n\n`,
    ]);

    const events: StreamEvent[] = [];
    for await (const event of parseSSEStream(reader)) {
      events.push(event);
    }

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("tool_call_done");
    if (events[0].type === "tool_call_done") {
      expect(events[0].args.stage).toBe("understand_background");
      expect(events[0].args.choices).toHaveLength(2);
    }
  });

  it("应解析 error 事件", async () => {
    const reader = createMockReader([
      'data: {"type":"error","message":"rate_limit"}\n\n',
    ]);

    const events: StreamEvent[] = [];
    for await (const event of parseSSEStream(reader)) {
      events.push(event);
    }

    expect(events).toEqual([{ type: "error", message: "rate_limit" }]);
  });

  it("应忽略无法解析的行", async () => {
    const reader = createMockReader([
      "data: invalid-json\n\n",
      'data: {"type":"done"}\n\n',
    ]);

    const events: StreamEvent[] = [];
    for await (const event of parseSSEStream(reader)) {
      events.push(event);
    }

    expect(events).toEqual([{ type: "done" }]);
  });

  it("应处理空流", async () => {
    const reader = createMockReader([]);

    const events: StreamEvent[] = [];
    for await (const event of parseSSEStream(reader)) {
      events.push(event);
    }

    expect(events).toEqual([]);
  });

  it("应处理连续多个事件在同一 chunk 中", async () => {
    const reader = createMockReader([
      'data: {"type":"text_delta","delta":"A"}\n\ndata: {"type":"text_delta","delta":"B"}\n\ndata: {"type":"text_delta","delta":"C"}\n\ndata: {"type":"done"}\n\n',
    ]);

    const events: StreamEvent[] = [];
    for await (const event of parseSSEStream(reader)) {
      events.push(event);
    }

    expect(events).toHaveLength(4);
    expect(events[0]).toEqual({ type: "text_delta", delta: "A" });
    expect(events[1]).toEqual({ type: "text_delta", delta: "B" });
    expect(events[2]).toEqual({ type: "text_delta", delta: "C" });
    expect(events[3]).toEqual({ type: "done" });
  });

  it("应处理缓冲区末尾残留的完整事件", async () => {
    // 最后一个事件没有尾部 \n\n
    const reader = createMockReader([
      'data: {"type":"text_delta","delta":"残留"}',
    ]);

    const events: StreamEvent[] = [];
    for await (const event of parseSSEStream(reader)) {
      events.push(event);
    }

    expect(events).toEqual([{ type: "text_delta", delta: "残留" }]);
  });
});
