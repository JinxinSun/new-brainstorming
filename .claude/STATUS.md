# 项目状态

## 正在做
（无进行中任务）

## 最近完成
- **2026-04-16** 准备把当前项目状态同步到远程仓库
  - 纳入跨会话协议文件：`AGENTS.md`、`.claude/STATUS.md`
  - 纳入 UX 验证脚本：`test-ux.mjs`（运行前需本地 dev server 在 `http://localhost:3000`）
  - 推送前校验：`npx vitest run` 34/34 通过；`npx tsc --noEmit` 通过；`npm run build` 通过；`npm run lint` 通过但保留 2 个既有 `<img>` warning
- **2026-04-16** 按审核报告精修 prompt（7 条改动），验收 agent 打 **8.5/10**，明确"不需要继续改、先实测"
  - ① Tool 段拆分"硬约束（stage）+ 按需传（其他）"+ 反向提示"不要为调 tool 硬凑选项/原型"
  - ② 新增 "# 反常规对话场景"：覆盖用户改方向/纠错/换话题/中途上传图/要求回看 5 种，明确 stage 可回退
  - ③ "其他（请描述）"措辞修正（核查 `ChoiceCards.tsx` 确认前端无自动 Other 输入框）
  - ④ Tool 段补齐 `requirements_summary` 规则：仅 stage 6 / 4 节 Markdown / 完整版
  - ⑤ `prototype_html` Tool 段对齐"原型生成"节的四件必备元素
  - ⑥ 推荐项规则改条件句：存在合理优劣才推荐；偏好类问题平铺
  - ⑩ 对话规则新增"复用用户原词"可操作指令
  - 34/34 测试通过、TS 零错误
- **2026-04-16** 重写 `prompts.ts`，直接借鉴 Superpowers brainstorming skill + Claude Code AskUserQuestion 工具的原文规则（见 `~/.claude/plans/peaceful-bubbling-backus.md`）
  - 新增"# 核心原则"（搬 Superpowers Key Principles：one question / preferred when possible / YAGNI / 探索方案 / 增量确认 / 保持灵活）
  - 重写"# 对话规则"+"# 选项使用"：从"优先选择题"改为"选项是工具，仅在分叉点/权衡/偏好时用"（对齐 AskUserQuestion 场景规则，2-4 个选项，推荐项首位标"（推荐）"）
  - 重写"# 原型生成"：删除 stage×原型 硬矩阵，采用 Visual Companion 的 per-question decision 原则（"这个问题用户看比读更易懂吗？"+概念/视觉问题对比例）
  - 新增"# 展示与推进节奏"：搬 Superpowers 的 Scale to complexity + Ask after each section
  - 保留 6 个 stage 定义、Tool 字段技术约束、对话上下文说明
  - 目的：修复用户反馈的"选项菜单化、过早出原型、每轮重刷原型、前后无逻辑"
  - 34/34 测试通过、TS 零错误；dev server（PID 12986）已 HMR 热更新
- **2026-04-16** 修复 UX 测试发现的 5 个 bug（P0/P1/P2），34 个单元测试通过、TS 类型检查通过
  - **P0/P2a 合并修复**（对话上下文未继承 + "你好"气泡）
    - 去掉 `page.tsx` 中 `useEffect` 自动发送"你好"
    - `useChat.ts` 新增 `WELCOME_MESSAGE` 常量，`ChatMessage` 新增 `isInitial?: boolean` 字段
    - `useReducer` 初始化时把 `WELCOME_MESSAGE` 注入 `messages[0]`
    - `buildApiMessages` 过滤 `isInitial` 消息（不发 API）
    - `prompts.ts` 删除"# 开场消息"一节，新增"# 对话上下文说明"告知 AI 首条已由前端展示
  - **P1 右侧面板早显示不当**
    - `prompts.ts` 强化 `prototype_html` 字段规则（必须 `<!DOCTYPE` 开头、严禁塞对话文字）
    - `useChat.ts` 新增 `isValidPrototypeHtml()` 校验；不合格的 html 丢弃保留旧值
  - **P1 进度条不推进**
    - `prompts.ts` 强化 stage 字段规则："每次都必须传 stage，推进时必须传新值"
  - **P2b 历史选项堆积**
    - `MessageList.tsx` 只在 `isLastAssistant` 时渲染 `ChoiceCards`（而非渲染但禁用）
  - **P3** 需求文档 v3 第 8 节列为 MVP 外 → 与用户确认后不做
- **2026-04-16** 建立跨会话工作协议（`AGENTS.md` + `.claude/STATUS.md`）
- **2026-04-16** 完成 MVP 首版（commit `142a748`）

## 下一步
1. 当前代码已准备同步远程。同步后继续在 http://localhost:3000 浏览器手动验证新 prompt 效果。重点看：
   - 前 1-3 轮 AI 是否不再每轮推选项
   - AI 追问时是否复用用户原词（员工/请假 而非 用户/流程）
   - stage 1-2 是否不出原型
   - 方案阶段原型出来后是否稳定
2. 如效果仍不理想，继续微调 prompt；如 AI 不吃某些规则，考虑是否 prompt 放前面（核心原则已置顶）。
3. 低优先级：处理 `ChatInput.tsx`、`MessageBubble.tsx` 中 `<img>` 触发的 Next.js lint warning。

## 关键参考文件
- `require/brainstorm-web-requirements_v3.md` — 产品需求文档
- `~/.claude/plans/staged-foraging-duckling.md` — 上次 UX 测试报告
- `AGENTS.md` — Next.js 版本警告 + 跨会话协议
