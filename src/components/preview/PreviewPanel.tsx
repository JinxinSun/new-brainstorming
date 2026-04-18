"use client";

import { useState } from "react";
import { PrototypeFrame } from "./PrototypeFrame";
import { WelcomeGuide } from "./WelcomeGuide";
import { RequirementsSummary } from "./RequirementsSummary";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  prototypeHtml: string | null;
  requirementsSummary: string | null;
}

type Tab = "prototype" | "summary";

export function PreviewPanel({
  prototypeHtml,
  requirementsSummary,
}: PreviewPanelProps) {
  const hasPrototype = !!prototypeHtml;
  const hasSummary = !!requirementsSummary;
  const [userTab, setUserTab] = useState<Tab | null>(null);
  // 需求文档出现时默认切到摘要 tab，除非用户手动切回原型
  const tab: Tab = userTab ?? (hasSummary ? "summary" : "prototype");

  if (!hasPrototype && !hasSummary) {
    return (
      <div className="h-full bg-white">
        <WelcomeGuide />
      </div>
    );
  }

  const showTabs = hasPrototype && hasSummary;
  const activeTab: Tab = showTabs ? tab : hasSummary ? "summary" : "prototype";

  return (
    <div className="h-full bg-white flex flex-col">
      {showTabs && (
        <div className="flex border-b border-gray-100 px-4 gap-1">
          <TabButton
            active={activeTab === "prototype"}
            onClick={() => setUserTab("prototype")}
          >
            原型
          </TabButton>
          <TabButton
            active={activeTab === "summary"}
            onClick={() => setUserTab("summary")}
          >
            需求文档
          </TabButton>
        </div>
      )}

      <div className="flex-1 min-h-0">
        {showTabs ? (
          <>
            <div
              className={cn(
                "h-full",
                activeTab === "prototype" ? "block" : "hidden",
              )}
            >
              <PrototypeFrame html={prototypeHtml!} />
            </div>
            <div
              className={cn(
                "h-full",
                activeTab === "summary" ? "block" : "hidden",
              )}
            >
              <RequirementsSummary summary={requirementsSummary!} />
            </div>
          </>
        ) : activeTab === "summary" && hasSummary ? (
          <RequirementsSummary summary={requirementsSummary!} />
        ) : (
          <PrototypeFrame html={prototypeHtml!} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
        active
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700",
      )}
    >
      {children}
    </button>
  );
}
