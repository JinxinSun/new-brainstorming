"use client";

import { MessageSquareText, Eye, FileText } from "lucide-react";

export function WelcomeGuide() {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
      <div className="max-w-sm text-center space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            需求探索工作台
          </h2>
          <p className="text-sm text-gray-500">
            在左侧和 AI 对话，这里会实时展示生成的原型
          </p>
        </div>

        <div className="space-y-4 text-left">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <MessageSquareText size={16} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">
                对话澄清
              </div>
              <div className="text-xs text-gray-500">
                AI 会一步步引导你理清想法
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <Eye size={16} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">
                原型预览
              </div>
              <div className="text-xs text-gray-500">
                讨论到页面时会在这里实时展示原型
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">
                需求文档
              </div>
              <div className="text-xs text-gray-500">
                对话结束后自动生成清晰的需求文档
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
