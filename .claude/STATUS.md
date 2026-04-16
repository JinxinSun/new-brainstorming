# 项目状态

## 正在做
- 阶段性保存当前改动并推送远程。用户明确要求：后续继续修复前，必须先分析问题、给出方案、经确认后再修改代码，不要直接动代码。

## 最近完成
- **2026-04-16** 按需求文档新产品原则最小改动 `src/lib/prompts.ts`，未重写全 prompt
  - 角色定义：`AI 产品顾问` → `AI 需求澄清顾问`，强调不是完成问卷/为了提问而提问
  - 核心原则：新增"所有原则服务于澄清客户需求；问题/选项/阶段/原型/文档都是工具"
  - 核心原则：`选择题优先` → `选择题按需辅助`，保留开放式回答，不把选项卡片当默认交互
  - 对话规则：新增"根据整体需求判断最值得澄清的信息缺口"，避免为了表面连贯忽略关键问题
  - 对话规则：新增"主动补用户没想到且与当前需求直接相关的问题"，覆盖角色/流程/数据/权限/异常/约束/成功标准/边界
  - 新增 `# 当前需求理解`：持续维护已确认信息、用户原词、关键决策、约束、待确认问题和下一步缺口；后续追问/总结/方案/原型基于它推进
  - 阶段 5：新增必要性检查，防止用户未要求、当前阶段不必要或过度设计的功能
  - Tool 规则：新增"即使调用 update_interface，也要附带一句简短自然语言承接；不要只输出工具调用"
  - 校验：`npx vitest run` 34/34 通过；`npx tsc --noEmit` 通过
- **2026-04-16** 手测仍出现"空白 AI 气泡 + 选项卡片"，已定位根因，但代码修复留到明天先讨论方案后再做
  - 直接请求 `/api/chat` 复现：模型只返回 `tool_call_done`，没有任何 `text_delta`
  - 根因：当前 Chat Completions + tool calling 架构下，模型选择 `update_interface` 后可能只返回 tool 参数，不返回自然语言正文；前端先创建空 assistant 占位，最终渲染成空白气泡
  - 建议方案待明天确认：tool schema 增加 `message` 字段并由服务端补发 text delta；前端同时兜底不渲染空 assistant 气泡；必要时过滤空 assistant 历史
  - 当前未提交这部分代码修复。用户已明确要求后续先分析问题、给方案、确认后再改代码
- **2026-04-16** 已将新的产品原则沉淀进 `require/brainstorm-web-requirements_v3.md`
  - 1.2 解决思路：AI 角色从"需求顾问一步步提问"调整为"需求澄清顾问 / 产品经理 / 需求分析师式协作"
  - 新增 1.4 产品原则：澄清需求优先、自然协作对话、问题是手段、主动补隐性问题、工具按场景使用、阶段是状态不是脚本、最终结果要可交付
  - 4.1 AI 引导对话：删除"优先使用选择题"硬导向，改为"选项卡片保留但作为辅助决策工具，由 AI 根据上下文判断"
  - 新增 4.2 需求理解沉淀：持续维护当前需求理解（已确认信息、关键决策、约束、待确认问题、下一步信息缺口）
  - 4.3 原型生成：改为按"看见比读文字更容易理解"触发，吸收 superpowers `visual-companion.md` 的 per-question 判断原则
  - 新增 4.5 需求自审查与收敛：吸收 superpowers spec review 思路，输出前检查完整性、一致性、清晰度、范围聚焦、必要性
  - 5.3 / 5.5：补充 AI 回复不能只展示控件；选项不替代自然对话；进度提示只反映状态，不作为强制脚本
- **2026-04-16** 已把当前项目状态同步到远程仓库（commit `e12096c`）
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
1. 明天继续前，先向用户复述当前问题和备选方案，不要直接改代码。
2. 重点待讨论/验证：
   - 空白 AI 气泡修复方案是否采用（当前只定位，尚未修复代码）
   - 模型仍可能过早给选项卡片，是否要继续压低 `choices` 触发条件
   - 模型在了解背景阶段可能过早生成 `prototype_html`，是否要在 prompt/tool schema 或服务端增加限制
3. 如果用户确认继续优化，再进入实现；修改后重新跑 `npx vitest run`、`npx tsc --noEmit`，必要时跑 `npm run build`。
4. 低优先级：处理 `ChatInput.tsx`、`MessageBubble.tsx` 中 `<img>` 触发的 Next.js lint warning。

## 关键参考文件
- `require/brainstorm-web-requirements_v3.md` — 产品需求文档
- `~/.claude/plans/staged-foraging-duckling.md` — 上次 UX 测试报告
- `AGENTS.md` — Next.js 版本警告 + 跨会话协议
