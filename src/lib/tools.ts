import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const UPDATE_INTERFACE_TOOL: ChatCompletionTool = {
  type: "function",
  function: {
    name: "update_interface",
    description:
      "同步本轮对话状态。必须传 stage；choices / prototype_html / requirements_summary 仅在满足各自触发条件时才传，大多数回复都不需要这些字段。",
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
            "选项列表。仅在三类场景传：(a) 明确分叉点（多个子需求/方案选一个）、(b) 概念权衡（同步 vs 异步等需要理解后再选）、(c) 偏好收集。反例：首次听到需求时就抛\"管理员维护/司机自助/两者都有/其他\"这类让用户选业务方向的菜单——该用开放提问。不确定不传，最多 5 个。",
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
