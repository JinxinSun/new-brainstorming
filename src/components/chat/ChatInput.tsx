"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (text: string, imageUrl?: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !imagePreview) return;
    onSend(trimmed, imagePreview ?? undefined);
    setText("");
    setImagePreview(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white p-3">
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img
            src={imagePreview}
            alt="待上传"
            className="h-16 rounded-lg border border-gray-200"
          />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-800"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={cn(
            "p-2 rounded-lg transition-colors shrink-0",
            disabled
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
          )}
          title="上传图片"
        >
          <ImagePlus size={20} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onInput={handleTextareaInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="输入你的想法..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
        />

        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !imagePreview)}
          className={cn(
            "p-2.5 rounded-xl transition-all shrink-0",
            disabled || (!text.trim() && !imagePreview)
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95",
          )}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
