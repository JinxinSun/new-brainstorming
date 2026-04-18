# 06-stage-progression: 进度条正确推进

**规则**（来自 `src/types.ts` stage 枚举 + `prompts.ts` Checklist 节）：
- stage 顺序：understand_background → scope_splitting → clarify_requirements → generate_solution → confirm_convergence → output_result
- 每次 tool_call 的 `stage` 字段驱动进度条
- 允许回退（用户换方向时）

## 前置

- 干净加载

## 步骤

1. 加载页面，记录进度条当前激活项对应的 stage id —— 期望 `understand_background`
2. 直接输入一个合理需求，比如：`我想做一个员工培训报名系统，公司 HR 用，员工可以自己报名`
3. 再答 2-3 轮充实背景，观察每轮后的进度条变化
4. 每轮 AI 回复完成后，读取进度条当前激活 stage，按顺序记录为 `stages[]`
5. 故意改方向，发送：`等等，我想换一个需求——我之前说的培训报名不做了，改成员工考勤打卡`
6. 等 AI 回复完成，再记一次 stage

## 期望

- 步骤 1 的初始 stage 是 `understand_background`
- `stages[]` 序列里相邻项满足：要么相等（AI 未推进）、要么严格按枚举顺序后移（不得跳过中间 stage，但允许某 stage 被跳过比如 `scope_splitting` 在单一需求时）
- 即：不应出现从 `understand_background` 直接跳到 `confirm_convergence`
- 步骤 6 后允许 stage 回退（比如回到 `understand_background` 或 `scope_splitting`，因为用户换了需求）
- 进度条 DOM 可见且响应式更新（每次 AI 回复完，页面无需刷新）

## 通过标准

stage 按枚举顺序推进、不乱跳；换方向后能回退。
