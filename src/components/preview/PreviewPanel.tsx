"use client";

import { PrototypeFrame } from "./PrototypeFrame";
import { WelcomeGuide } from "./WelcomeGuide";

interface PreviewPanelProps {
  prototypeHtml: string | null;
}

export function PreviewPanel({ prototypeHtml }: PreviewPanelProps) {
  return (
    <div className="h-full bg-white">
      {prototypeHtml ? (
        <PrototypeFrame html={prototypeHtml} />
      ) : (
        <WelcomeGuide />
      )}
    </div>
  );
}
