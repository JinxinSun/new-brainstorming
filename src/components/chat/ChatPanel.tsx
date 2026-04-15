"use client";

import type { ChatMessage, Choice } from "@/types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string, imageUrl?: string) => void;
  onChoiceSelect: (choice: Choice) => void;
}

export function ChatPanel({
  messages,
  isLoading,
  onSend,
  onChoiceSelect,
}: ChatPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <MessageList
        messages={messages}
        onChoiceSelect={onChoiceSelect}
        isLoading={isLoading}
      />
      <ChatInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}
