# 04-prototype-offer-flow: 原型 offer 流程

**规则**（来自 `prompts.ts` "视觉辅助原则"节 + `useChat.ts` EARLY_STAGES 警告）：
- stage `understand_background` / `scope_splitting` 阶段首次想画原型必须**先征求同意**，且不得传 `prototype_html`
- stage 4+（`generate_solution` 及之后）方案可视化是默认动作，不用问
- prototype_html 出现在早期 stage 时会触发 `[brainstorm] drop: prototype_html in early stage` 警告

## 前置

- 干净加载

## 步骤

1. 直接输入一个**高度视觉化**的需求以诱发 AI 想画原型：`做一个销售业绩展示大屏，要有排名榜、折线图、指标卡片`
2. 等 AI 回复完成
3. 检查**右侧预览面板**：在本轮结束时，预览区是否已经被 AI 塞了完整的原型 iframe 内容
4. 检查**左侧对话气泡**：AI 是否在文字中征求画原型的同意（含"可以吗"、"画个线框"、"画一下"等 offer 语义之一）
5. 继续对话，明确回答 `可以，画一下大概样子`（若 AI 征得同意则测验其能否画；若没征求反而直接画了，记录违规）
6. 等 AI 回复完成，确认此轮预览区内出现原型 iframe（`<iframe>` 或 shadow root 渲染的 HTML 内容）

## 期望

- 在步骤 2（stage 仍为 understand_background）时：
  - **期望 A（理想）**：右侧预览区**仍为空/欢迎态**，AI 气泡文字中含 offer 语义
  - **不允许**：右侧预览区已有 AI 生成的完整原型（文件检查：iframe srcdoc 的长度 > 200，说明已经画了大原型）
  - 若违规：Console 必含警告 `[brainstorm] drop: prototype_html in early stage`
- 在步骤 6（用户明确同意后）：
  - 右侧预览区内出现原型内容（iframe 或渲染的 HTML）
  - 内容中含中文文字（非空占位）
- 进度条可能已推进到 `clarify_requirements` 或 `generate_solution`，允许

## 通过标准

stage 1-3 首次画原型前 AI 先征求同意；用户同意后预览区才出现内容；无 early stage 警告。
