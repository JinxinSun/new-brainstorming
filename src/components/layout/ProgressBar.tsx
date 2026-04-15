"use client";

import type { ConversationStage } from "@/types";
import { STAGE_ORDER, STAGE_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStage: ConversationStage;
}

export function ProgressBar({ currentStage }: ProgressBarProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="flex items-center justify-center gap-1 px-6 py-3 bg-white border-b border-gray-100">
      {STAGE_ORDER.map((stage, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div key={stage} className="flex items-center">
            {index > 0 && (
              <div
                className={cn(
                  "w-6 h-px mx-1",
                  isCompleted ? "bg-blue-400" : "bg-gray-200",
                )}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
                  isActive && "bg-blue-500 text-white",
                  isCompleted && "bg-blue-100 text-blue-600",
                  !isActive && !isCompleted && "bg-gray-100 text-gray-400",
                )}
              >
                {isCompleted ? <Check size={12} /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-xs whitespace-nowrap transition-colors",
                  isActive && "text-blue-600 font-medium",
                  isCompleted && "text-blue-500",
                  !isActive && !isCompleted && "text-gray-400",
                )}
              >
                {STAGE_LABELS[stage]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
