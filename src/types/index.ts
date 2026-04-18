export type ConversationStage =
  | "understand_background"
  | "scope_splitting"
  | "clarify_requirements"
  | "generate_solution"
  | "confirm_convergence"
  | "output_result";

export const STAGE_LABELS: Record<ConversationStage, string> = {
  understand_background: "了解背景",
  scope_splitting: "拆分范围",
  clarify_requirements: "逐项澄清",
  generate_solution: "方案可视化",
  confirm_convergence: "确认收敛",
  output_result: "输出结果",
};

export const STAGE_ORDER: ConversationStage[] = [
  "understand_background",
  "scope_splitting",
  "clarify_requirements",
  "generate_solution",
  "confirm_convergence",
  "output_result",
];

export interface Choice {
  id: string;
  label: string;
  description?: string;
}

export interface UpdateInterfaceArgs {
  reply_text?: string;
  stage?: ConversationStage;
  choices?: Choice[];
  prototype_html?: string;
  requirements_summary?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  choices?: Choice[];
  isStreaming?: boolean;
  timestamp: number;
  // 前端硬编码的开场消息，不发送给 API
  isInitial?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  currentStage: ConversationStage;
  prototypeHtml: string | null;
  requirementsSummary: string | null;
  isLoading: boolean;
  error: string | null;
}

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } };

export type StreamEvent =
  | { type: "text_delta"; delta: string }
  | { type: "tool_call_done"; args: UpdateInterfaceArgs }
  | { type: "error"; message: string }
  | { type: "done" };
