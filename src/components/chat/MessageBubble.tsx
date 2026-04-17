"use client";

import type { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (
    !isUser &&
    !message.isStreaming &&
    message.content.trim() === "" &&
    !message.imageUrl
  ) {
    return null;
  }

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium shrink-0">
          AI
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-blue-500 text-white rounded-br-md"
            : "bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm",
        )}
      >
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="上传的图片"
            className="max-w-[200px] rounded-lg mb-2"
          />
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm shrink-0">
          你
        </div>
      )}
    </div>
  );
}
