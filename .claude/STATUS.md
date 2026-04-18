# 项目状态

## 正在做
- **v3 prompt 架构重构已落地并完成 Playwright MCP 验收：`src/lib/prompts.ts` 已重写，`src/lib/tools.ts` 描述已调整，新增 6 个 e2e 顾问行为用例；静态验证全过；最新 tester 14/14 常规用例通过，额外业务 UX 验收通过**
- 新计划路径：`/Users/king/.claude/plans/consultative-v3-prompt-rewrite-plan.md`
- v2 修复仍在工作区未提交：QuestionCard 兜底、reply_text 强制、早期 stage 硬防线、需求文档 tab 渲染，端到端 8/8 曾全绿，但用户手测认为整体对话仍不自然，不能视为最终验收
- 已按通过评审的计划重写 `src/lib/prompts.ts`、小幅调整 `src/lib/tools.ts`，并新增/调整 e2e 咨询行为用例
- 用户最终通过后再 commit
- v1 已 commit + push 到 origin/main（commit `2f4028a`）

## 当前判断（2026-04-18）

- 用户纠偏：问题不是单纯 `choices` 过多，不能围绕选择题打补丁；应重新思考整体 Superpowers brainstorming 网页化应该怎么做。
- 最新方案：把 prompt 从“工具/阶段驱动”重构成“咨询式对话驱动”。AI 每轮先理解用户意图、承接/修正/归纳，再推进一个关键缺口；最后才决定是否使用 `choices`、`prototype_html`、`requirements_summary`。
- `stage` 降级为 UI 进度标签，不再作为行为脚本。
- `choices` 不作为核心优化对象，只是辅助快捷回复；UI 暂不改，等 prompt 行为收敛后再评估。
- 必须保留 v2 稳定性硬约束：`reply_text` 必填、stage 1-2 禁原型、summary 只在最终输出、stage 可回退、空内容兜底等。
- 2026-04-18 重新写了计划文件，删除“解决历史问题”的叙事，把重点放在重新设计 AI 需求顾问 prompt 架构。
- 第二轮评审后补强：加入“顾问感行为验收”、进一步下沉 stage 为标签、补充 prompt/tool/UI 问题分流边界。
- 已按用户要求派无上下文 subagent，先阅读 `/Users/king/.claude/skills/brainstorming/SKILL.md` 和 `visual-companion.md` 后评审新方案。评审结论：方向正确、更接近 Superpowers；仍建议进一步削弱流程味，把“一次只推进一个关键点”和“按问题决定是否视觉化”写得更硬，并将 stage/最终文档结构继续压到输出协议附录。
- 已按第三轮评审意见继续修改计划：新增“核心纪律”，把“一次只推进一个关键点”“纠错优先”“按具体问题决定是否视觉化”前置；把 stage、工具、最终文档结构合并压到“输出协议附录”；新增单轮只推进一个关键点的测试场景。
- 第四轮 subagent 先读 Superpowers 后复审，结论：**通过**。非阻塞建议：实现时可补“多独立子系统必须先拆分”的 e2e；避免模型过早进入最终文档总结态。
- 本轮实现已吸收非阻塞建议：新增 `14-scope-decomposition.md` 覆盖多独立子系统先拆分；prompt 中将 `requirements_summary` 压到输出协议附录，强调只在收敛后输出。

## 2026-04-18 v3 实现进度

- `src/lib/prompts.ts`：从阶段/工具驱动结构重写为咨询式 prompt，前置核心纪律：先理解再推进、一次只推进一个关键点、纠错优先、信息够了就假设推进、按具体问题决定是否视觉化；stage/工具/最终文档结构已压到输出协议附录。
- `src/lib/tools.ts`：不改字段结构，只调整 description，强调 `reply_text` 是主输出，其他字段是辅助展示；`choices`、`prototype_html`、`requirements_summary` 触发条件更贴近咨询式主线。
- `tests/e2e/cases/04-prototype-offer-flow.md`：更新 early-stage 原型警告文本为当前 reducer 实际日志。
- 新增 e2e：
  - `09-consultative-management-feature.md`：普通管理功能先归纳，不把基础动作拆成问卷
  - `10-correction-first.md`：用户纠错后先修正理解
  - `11-assumption-progress.md`：信息足够时假设推进
  - `12-conceptual-ui-no-prototype.md`：UI 相关但概念性问题不自动出原型
  - `13-single-key-gap.md`：单轮只推进一个关键点
  - `14-scope-decomposition.md`：多独立子系统先拆分范围
- 静态验证结果：
  - `npx vitest run`：44/44 通过
  - `npx tsc --noEmit`：通过
  - `npm run lint`：通过，仅保留既有 2 个 `<img>` warning（`ChatInput.tsx`、`MessageBubble.tsx`）
  - `npm run build`：通过，仅保留既有 Edge runtime static generation warning
- tester subagent 验收状态：
  - 已派 worker subagent 按 `.claude/agents/tester.md` 执行 Playwright MCP 验收
  - 结果：0/14 cases 执行；不是用例失败，而是环境阻塞
  - 阻塞原因：本次 subagent 会话没有暴露 `mcp__playwright__*` 工具命名空间，无法按 tester 协议驱动浏览器
  - 已复核：本机 `~/.claude.json` 注册了 `playwright` MCP server，`npx @playwright/mcp@latest --help` 可正常运行；问题不是本机未安装 Playwright MCP，而是当前会话/subagent 的 MCP 注入问题
  - 本地项目依赖里没有 `playwright` / `@playwright/test` / `playwright-core`，因此不能用普通 Node Playwright 脚本替代 MCP 跑完整验收；但这不影响 MCP 方式在新会话/正确注入环境中运行
  - 2026-04-18 用户再次要求安排 subagent 使用 Playwright MCP 跑默认真人自动化测试；已派 worker subagent `Cicero` 复测。结果仍为 0/14 cases 执行，`.env.local` 和 `OPENAI_API_KEY` 存在，但子代理会话未暴露任何 `mcp__playwright__*` 工具，按 tester 协议未启动 dev server 并退出。
  - 2026-04-18 继续排查原因：Claude Code 与 Codex Desktop/CLI 使用不同的 MCP 配置来源。`~/.claude.json` 全局 `mcpServers` 确有 `playwright`；但 `/Users/king/.codex/config.toml` 无 MCP server 配置，`codex mcp list` 返回 `No MCP servers configured yet`，当前 Codex 可见工具命名空间也没有 `mcp__playwright__*`。结论：Playwright MCP 本机可用，但未注册到 Codex 侧；子代理继承不到是 Codex MCP 配置为空导致的。
  - 2026-04-18 已执行修复：运行 `codex mcp add playwright -- npx @playwright/mcp@latest`，`codex mcp list` 现显示 `playwright` enabled，`codex mcp get playwright` 显示 stdio / command `npx` / args `@playwright/mcp@latest`。当前已启动的 Codex 会话仍不会热加载出 `mcp__playwright__*` 工具；下一步需要重启 Codex Desktop 或新开 Codex 会话后再派 tester。
  - 2026-04-18 重启后 tester `James` 成功跑完 14 个 cases：11 通过 / 3 失败。失败：04 early visual request 未 offer 原型；07 输出需求文档时右侧无保留原型 iframe；10 用户纠错后仍出现 choices。已基于报告修改 `src/lib/prompts.ts`、`src/lib/tools.ts`、`src/components/preview/PreviewPanel.tsx`。
  - 修改后静态验证：`npx vitest run` 44/44 通过；`npx tsc --noEmit` 通过；`npm run lint` 仅既有 2 个 `<img>` warning；`npm run build` 通过，仅既有 Edge runtime static generation warning。
  - 第二轮 tester `Lovelace` 未执行 cases：Playwright MCP 导航时报 `ENOENT mkdir '/.playwright-mcp'`，说明 MCP server 当前会话用旧参数把输出目录解析到根目录。已重新配置 Codex MCP：`codex mcp remove playwright` 后 `codex mcp add playwright -- npx @playwright/mcp@latest --output-dir /Users/king/code/web-brainstorming/.playwright-mcp`。当前会话杀掉旧 MCP 后 transport closed，Codex 未热重连；需要再次重启 Codex 后重跑 tester。
  - 2026-04-18 用户重启 Codex 后，Playwright MCP 已在 Codex 会话中可用。
  - tester `Euclid` 做 14 个常规 e2e + 3 个业务 UX 场景：12/14 通过，失败为 04 同轮 offer+iframe、10 纠错后仍有 choices。业务评分 7/10，核心问题是 choices 仍偏多。
  - 已继续修复 `src/hooks/useChat.ts` reducer 防线：纠错轮强制丢弃 choices；`output_result` 或 `requirements_summary` 回合强制丢弃 choices；若助手文案是在询问是否画原型且用户上一轮未明确同意，同轮丢弃 `prototype_html`。同步新增 4 个 reducer 单测。
  - 最新静态验证（2026-04-18）：`npx vitest run` 48/48 通过；`npx tsc --noEmit` 通过；`npm run lint` 通过，仅既有 2 个 `<img>` warning；`npm run build` 通过，仅既有 Edge runtime static generation warning。
  - 最新 tester `Newton` 完成 Playwright MCP 业务复测：14/14 常规 cases 全通过；额外 3 个业务 UX 验收通过；业务 UX 评分 8.5/10。报告：`tests/e2e/artifacts/run-2026-04-18-playwright-mcp-business-after-fix.log`。
  - Newton 业务观察：额外抽查 4 个业务场景，共 8 次实质 AI 回复，其中 5 次 choices，且都出现在真实分叉/方案选择位置；纠错回合 0 次 choices；销售大屏早期未直接塞 iframe，用户明确同意后才出现原型；权限概念题不自动画原型；最终 4 节 Markdown 需求文档没有夹带 `A?/B?` 空菜单。

## 最近完成

### **2026-04-17** 端到端 8/8 全绿（4 轮迭代后基线成立）

**触发**：用户"我不希望你每次都问我，测试出来问题后你自己去改，直到全部通过后让我验收"。AGENTS.md 里"端到端验证协议"允许 2-3 轮 tester 自迭代。

**tester 4 轮结果演进**：

| 轮次 | 通过 | 关键发现 / 修复 |
|---|---|---|
| 1 | 6/8 | Case 03/04 失败：AI 在 stage 1 只调 prototype_html 工具不出文字 |
| 2 | 2/8 | 暴露更深问题：AI 系统性"只调工具不说话"，3 轮对话全空气泡 |
| 3 | 6/8 | 协议层硬改生效（reply_text 必填 + route 层注入 text_delta）；剩 Case 07（summary 没渲染）+ Case 08（图片 400） |
| 4 | **8/8** | Case 07 加 RequirementsSummary 组件 + Tab；Case 08 加真实 PNG fixture；reducer 加 SUMMARY_STAGES 守卫防回归 |

**本次工作区所有改动（全部未 commit）**：

- `src/lib/prompts.ts`：整体按 superpowers 重写（铁律 4 条 + 按阶段输出约束表 + reply_text 强调 + 原型 offer 流程分 stage 细化）
- `src/lib/tools.ts`：
  - `update_interface` description 强调"此工具调用不替代对话文字"
  - 新增 `reply_text` 必填字段（required: ["reply_text", "stage"]）
  - `prototype_html` 明确"前端会强制丢弃 early stage"
  - `choices` 禁"其他（请描述）"兜底 + minItems:2
- `src/types/index.ts`：`UpdateInterfaceArgs` 加 `reply_text?: string`
- `src/app/api/chat/route.ts`：新增 `hasStreamedText` 追踪；tool_call_done 时若未 stream 过顶层 text 且 args.reply_text 非空，把 reply_text 作为一次性 text_delta 注入 SSE 流（兜底保证对话气泡非空）
- `src/hooks/useChat.ts`：
  - 早期 stage（understand_background / scope_splitting）硬丢弃 prototype_html，log `drop: prototype_html in early stage`
  - 摘要 stage（confirm_convergence / output_result）外丢弃 requirements_summary，log `drop: requirements_summary at stage`
- `src/components/chat/QuestionCard.tsx`：空内容 + 非流式时返回 null
- `src/components/preview/RequirementsSummary.tsx`：**新增**，用 react-markdown 渲染 4 节需求文档
- `src/components/preview/PreviewPanel.tsx`：加 `requirementsSummary` prop，实现 "原型 / 需求文档" tab 切换；summary 出现时默认激活文档 tab；用户可切回原型
- `src/app/page.tsx`：传 `requirementsSummary` 给 PreviewPanel
- `src/__tests__/chatReducer.test.ts`：
  - 加 early stage prototype_html 丢弃测试（2 个）
  - 加 clarify_requirements 允许 prototype_html 测试
  - 加 requirements_summary 在非 summary stage 丢弃测试
  - 加 confirm_convergence 允许 requirements_summary 测试
  - 修复"应接受 <!DOCTYPE" 测试漏传 stage 导致被新守卫误伤
- `tests/e2e/fixtures/sample-screenshot.png`：**新增**真实 PNG（macOS 系统壁纸缩略图 107x65 RGBA 14KB）

**自动化全过**：
- `npx vitest run`：44/44 ✓（新增 5 个 reducer 测试）
- `npx tsc --noEmit`：零错
- `npm run lint`：仅既有 2 个 `<img>` warning
- `npm run build`：清洁通过

**tester 第 4 轮完整通过观察**：
- Case 02：3 轮 AI 回复 32/89/65 字，无任何 fallback 警告
- Case 03：分叉选项"技术部试点（推荐）/ 所有部门通用"，底部输入兜底可见
- Case 04：stage 1 `drop: prototype_html in early stage` 正确拦截，用户同意后 iframe 正常渲染
- Case 05：stage 4 方案"基础报名版（推荐）/ 报名+审批版 / 报名+候补通知版"，含"我更倾向"表述
- Case 06：stage 枚举顺序 1→2→3→4，换方向回退到 1，进度条同步
- Case 07：4 节需求文档 Markdown 渲染；"原型 / 需求文档" tab 切换工作；默认激活文档 tab
- Case 08：新 fixture 上传，AI 回复含"我看到你是在说后台员工列表页"+"字段"

**tester 报告的非阻塞提示**（交给用户判断）：
- Case 07 首次尝试在 stage 3 时 AI 遇到"给方案+画原型"同轮任务陷入 10+ 分钟长流式，分步走第二次通过。可能要在 prompts 中加"单轮只做一件事"约束
- React `两个 children 相同 key` 警告在多轮对话中稳定出现，已有问题非本轮引入
- HMR WebSocket 连接失败，dev server 层面，不影响功能

## 下一步（按顺序）

1. 交给用户/Claude 复核最新测试报告与产品体验结论
2. 用户手测语气与自然度，通过后再 commit
3. **长期监测**：
   - 若 tester 报的长流式问题复现，在 prompts 加"单轮只做一件事"
   - key 警告单独立 issue 排查

## 关键参考文件
- `~/.claude/plans/prompt-ai-askuserquestion-superpowers-b-effervescent-clock.md` —— v3 plan（含 superpowers 对照表、3 个用户确认方向、完整实施计划）
- `/Users/king/.claude/plans/consultative-v3-prompt-rewrite-plan.md` —— 最新 v3 咨询式 prompt 重构计划（当前待审）
- `~/.claude/plans/greedy-tickling-summit.md` —— 上轮 plan（v1 + v2）
- `/Users/king/.claude/skills/brainstorming/SKILL.md` —— 借鉴源头
- `require/brainstorm-web-requirements_v3.md` —— 产品需求文档
- `AGENTS.md` —— Next.js 版本警告 + 跨会话协议 + 端到端验证协议
- `tests/e2e/cases/*.md` —— 8 个 e2e 用例
- `tests/e2e/fixtures/sample-screenshot.png` —— Case 08 上传 fixture
