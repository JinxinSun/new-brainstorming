"use client";

import type { Choice } from "@/types";
import { cn } from "@/lib/utils";

interface ChoiceCardsProps {
  choices: Choice[];
  onSelect: (choice: Choice) => void;
  disabled?: boolean;
}

export function ChoiceCards({ choices, onSelect, disabled }: ChoiceCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-2 pl-11">
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onSelect(choice)}
          disabled={disabled}
          className={cn(
            "text-left px-4 py-3 rounded-xl border transition-all duration-150",
            disabled
              ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm active:scale-[0.98] cursor-pointer",
          )}
        >
          <div className="font-medium text-sm">{choice.label}</div>
          {choice.description && (
            <div className="text-xs text-gray-500 mt-1">
              {choice.description}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
