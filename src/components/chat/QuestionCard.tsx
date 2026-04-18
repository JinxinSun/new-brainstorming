"use client";

import type { ChatMessage, Choice } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  message: ChatMessage;
  onChoiceSelect: (choice: Choice) => void;
  disabled?: boolean;
}

const LETTER_PREFIX = ["A", "B", "C", "D", "E"];

export function QuestionCard({
  message,
  onChoiceSelect,
  disabled,
}: QuestionCardProps) {
  const hasChoices = !!message.choices && message.choices.length > 0;
  // welcome 开场（isInitial）不显 tag / 占位，避免破坏引导语气
  const showMeta = hasChoices && !message.isInitial;

  // 对称 MessageBubble：空内容 + 无选项 + 非流式时不渲染空卡片
  if (!hasChoices && !message.isStreaming && message.content.trim() === "") {
    return null;
  }

  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium shrink-0">
        AI
      </div>

      <div className="max-w-[85%] rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3 text-sm leading-relaxed">
        {showMeta && (
          <div className="mb-2">
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
              单选
            </span>
          </div>
        )}

        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 text-gray-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle" />
          )}
        </div>

        {hasChoices && (
          <div className="mt-3 flex flex-col gap-2">
            {message.choices!.map((choice, idx) => (
              <button
                key={choice.id}
                onClick={() => onChoiceSelect(choice)}
                disabled={disabled}
                className={cn(
                  "text-left px-4 py-3 rounded-xl border transition-all duration-150 flex items-start gap-3",
                  disabled
                    ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm active:scale-[0.98] cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "font-medium text-xs shrink-0 mt-0.5",
                    disabled ? "text-gray-300" : "text-gray-400",
                  )}
                >
                  {LETTER_PREFIX[idx] ?? String(idx + 1)}
                </span>
                <span className="flex-1">
                  <span className="font-medium text-sm block">
                    {choice.label}
                  </span>
                  {choice.description && (
                    <span className="text-xs text-gray-500 block mt-0.5">
                      {choice.description}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}

        {showMeta && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
            或者直接在下方输入你的想法...
          </div>
        )}
      </div>
    </div>
  );
}
