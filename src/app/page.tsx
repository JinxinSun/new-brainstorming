"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import type { Choice } from "@/types";

export default function Home() {
  const { state, sendMessage } = useChat();
  const initialized = useRef(false);

  // 页面加载时触发 AI 开场消息
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    sendMessage("你好");
  }, [sendMessage]);

  const handleChoiceSelect = (choice: Choice) => {
    sendMessage(choice.label);
  };

  return (
    <div className="flex flex-col h-screen">
      <ProgressBar currentStage={state.currentStage} />

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧对话面板 ~35% */}
        <div className="w-[35%] min-w-[320px] border-r border-gray-200 flex flex-col">
          <ChatPanel
            messages={state.messages}
            isLoading={state.isLoading}
            onSend={sendMessage}
            onChoiceSelect={handleChoiceSelect}
          />
        </div>

        {/* 右侧预览面板 ~65% */}
        <div className="flex-1">
          <PreviewPanel prototypeHtml={state.prototypeHtml} />
        </div>
      </div>

      {state.error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm shadow-lg">
          {state.error}
        </div>
      )}
    </div>
  );
}
