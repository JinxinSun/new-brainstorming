"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage, Choice } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { ChoiceCards } from "./ChoiceCards";

interface MessageListProps {
  messages: ChatMessage[];
  onChoiceSelect: (choice: Choice) => void;
  isLoading: boolean;
}

export function MessageList({
  messages,
  onChoiceSelect,
  isLoading,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg, index) => {
        const isLastAssistant =
          msg.role === "assistant" && index === messages.length - 1;
        const hasChoices = msg.choices && msg.choices.length > 0;
        // 只在最新一条 AI 消息上渲染 choices，避免历史选项堆积
        const showChoices = hasChoices && isLastAssistant;

        return (
          <div key={msg.id} className="space-y-3">
            <MessageBubble message={msg} />
            {showChoices && (
              <ChoiceCards
                choices={msg.choices!}
                onSelect={onChoiceSelect}
                disabled={isLoading}
              />
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
