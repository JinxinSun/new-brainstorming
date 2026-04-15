import { NextRequest } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { openai } from "@/lib/openai";
import { UPDATE_INTERFACE_TOOL } from "@/lib/tools";
import { buildSystemPrompt } from "@/lib/prompts";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages } = body as {
    messages: ChatCompletionMessageParam[];
  };

  const allMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt() },
    ...messages,
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      };

      try {
        const response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL ?? "gpt-4o",
          messages: allMessages,
          tools: [UPDATE_INTERFACE_TOOL],
          tool_choice: "auto",
          stream: true,
          temperature: 0.7,
          max_tokens: 4096,
        });

        let toolCallAccumulator: {
          id: string;
          name: string;
          argumentsJson: string;
        } | null = null;

        for await (const chunk of response) {
          const choice = chunk.choices[0];
          if (!choice) continue;

          const delta = choice.delta;

          // 文本增量
          if (delta?.content) {
            send({ type: "text_delta", delta: delta.content });
          }

          // Tool call 增量
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (tc.id) {
                toolCallAccumulator = {
                  id: tc.id,
                  name: tc.function?.name ?? "",
                  argumentsJson: tc.function?.arguments ?? "",
                };
              } else if (toolCallAccumulator) {
                toolCallAccumulator.argumentsJson +=
                  tc.function?.arguments ?? "";
              }
            }
          }

          // 流结束
          if (choice.finish_reason === "tool_calls" && toolCallAccumulator) {
            try {
              const args = JSON.parse(toolCallAccumulator.argumentsJson);
              send({ type: "tool_call_done", args });
            } catch {
              send({ type: "error", message: "tool_call_parse_error" });
            }
          }

          if (choice.finish_reason === "stop") {
            // AI 没有调用 tool（回退情况），也要发 done
          }
        }

        send({ type: "done" });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "unknown_error";
        send({ type: "error", message });
        send({ type: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
