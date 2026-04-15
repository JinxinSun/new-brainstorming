import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const UPDATE_INTERFACE_TOOL: ChatCompletionTool = {
  type: "function",
  function: {
    name: "update_interface",
    description:
      "更新界面状态。每次回复都必须调用此工具，用于更新对话阶段、展示选项卡片或更新原型预览。",
    parameters: {
      type: "object",
      properties: {
        stage: {
          type: "string",
          enum: [
            "understand_background",
            "scope_splitting",
            "clarify_requirements",
            "generate_solution",
            "confirm_convergence",
            "output_result",
          ],
          description:
            "当前对话所处的阶段。阶段未变化时可不传。",
        },
        choices: {
          type: "array",
          description:
            "供用户点击的选项列表。本轮不需要选择题时不传。最多 5 个选项。",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "选项唯一标识，同时作为用户选择后发送给 AI 的文本",
              },
              label: {
                type: "string",
                description: "卡片上显示的简短文字，不超过 20 字",
              },
              description: {
                type: "string",
                description: "补充说明（可选），不超过 50 字",
              },
            },
            required: ["id", "label"],
          },
          maxItems: 5,
        },
        prototype_html: {
          type: "string",
          description:
            "完整的 HTML 文档字符串，渲染在右侧 iframe 中。必须是独立可运行的 HTML（含 <!DOCTYPE html>、<html>、<head>、<body>）。使用内联 <style> 写 CSS，禁止外部资源。不更新原型时不传此字段。",
        },
        requirements_summary: {
          type: "string",
          description:
            "仅在 stage=output_result 时使用。Markdown 格式的完整需求文档。",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
};
