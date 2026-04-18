import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const UPDATE_INTERFACE_TOOL: ChatCompletionTool = {
  type: "function",
  function: {
    name: "update_interface",
    description:
      "同步本轮对话状态。reply_text 和 stage 必传；reply_text 是主输出，前端会把它渲染成对话气泡。choices / prototype_html / requirements_summary 都只是辅助展示字段，不确定时只传 reply_text + stage，不要为了使用工具而硬塞辅助字段。",
    parameters: {
      type: "object",
      properties: {
        reply_text: {
          type: "string",
          description:
            "你要对用户说的自然语言（完整回复文字）。这是对话气泡的唯一内容来源，必须非空。写法：协作型需求顾问语气，先承接/归纳用户原词，再推进一个关键点；用户纠错时先修正理解；信息足够时可声明合理假设继续。严禁在此字段里塞 HTML、Markdown 表单、或者空串。",
        },
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
            "UI 进度标签，不是行为脚本。必须根据真实对话进展标记当前大致位置，可前进也可回退；不要因为某个 stage 就机械使用 choices 或 prototype_html。",
        },
        choices: {
          type: "array",
          description:
            "快捷回复建议，不是默认提问方式。只在真实取舍、方案倾向、独立范围拆分、偏好选择时传；普通需求澄清、用户纠错后的下一轮、概念/权限/规则讨论、同一功能的动作/字段/状态/筛选项，绝对不要做成 choices。不确定时不要传。至少 2 个、最多 5 个。不要加\"其他（请描述）\"类兜底项，UI 已有自由输入入口。",
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
          minItems: 2,
          maxItems: 5,
        },
        prototype_html: {
          type: "string",
          description:
            "视觉辅助原型，只有当前具体问题需要布局、空间关系、流程可视化或视觉方案对比时才传。UI 话题不自动等于视觉问题；概念、权限、规则、风险、范围讨论留在文字里。stage=understand_background 或 scope_splitting 时绝对禁止传，前端会强制丢弃；早期明显视觉化对象只用 reply_text 征求是否画粗略线框。进入 generate_solution 后，若用户接受页面/列表/表单/大屏/看板方案或要求画一下，应传一版完整原型。必须是完整独立 HTML 文档（含 <!DOCTYPE html>、<html>、<head>、<body>），使用内联 <style>，禁止外部资源。不更新原型时不传。",
        },
        requirements_summary: {
          type: "string",
          description:
            "仅在 stage=output_result 且用户确认可以输出最终文档时使用。阶段性总结请写在 reply_text，不要在对话半路自动写最终文档。Markdown 格式的完整需求文档。",
        },
      },
      required: ["reply_text", "stage"],
      additionalProperties: false,
    },
  },
};
