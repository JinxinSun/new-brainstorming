"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage, Choice } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { QuestionCard } from "./QuestionCard";

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

        return (
          <div key={msg.id}>
            {isLastAssistant ? (
              <QuestionCard
                message={msg}
                onChoiceSelect={onChoiceSelect}
                disabled={isLoading}
              />
            ) : (
              <MessageBubble message={msg} />
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
