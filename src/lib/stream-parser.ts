import type { StreamEvent } from "@/types";

/**
 * 解析 SSE 流，yield StreamEvent 对象。
 * 处理 "data: {...}\n\n" 格式。
 */
export async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<StreamEvent> {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data: ")) continue;
      try {
        const event: StreamEvent = JSON.parse(line.slice(6));
        yield event;
      } catch {
        // 忽略无法解析的行
      }
    }
  }

  // 处理缓冲区中残留的数据
  if (buffer.trim().startsWith("data: ")) {
    try {
      const event: StreamEvent = JSON.parse(buffer.trim().slice(6));
      yield event;
    } catch {
      // 忽略
    }
  }
}
