<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 跨会话工作协议

<context>
本项目任务可能跨多个会话进行。上下文窗口会被重置，未持久化的进度会丢失。
`.claude/STATUS.md` 是上下个会话之间唯一可靠的交接凭证，路径固定。
</context>

<session_start>
任务开始前，先读 `.claude/STATUS.md`（若存在）了解上次进度，再通过
git log 等手段了解近期代码变更。向用户汇报你的理解 —— 如果对"该做什么"
有不确定，先确认再动手；方向明确的小任务可直接执行。
</session_start>

<progress_tracking>
把对下个会话重要的信息写进 `.claude/STATUS.md`：当前在做什么、最近完成
了什么、下一步应该做什么。写多细、用什么格式、什么时候更新，你自己判断，
核心标准是：**下个会话的你能仅凭这份文件无歧义地接上工作**。
任务完成时再更新一次，把"下一步"写清楚。
</progress_tracking>

## 端到端验证协议

<context>
改动代码后让用户手动点浏览器验证对话流程，用户是瓶颈。本项目有一个
`tester` subagent（定义在 `.claude/agents/tester.md`），职责是用
Playwright MCP 按 `tests/e2e/cases/*.md` 的预写用例走一遍冒烟集，报告
通过/失败与截图。测试真调 OpenAI，有成本但可控（一轮约 $0.3-0.7）。
</context>

<after_code_change>
修改 `src/` 下任何文件后、交付用户审核前，执行流程：

1. 静态自动化照常：`npx vitest run` + `npx tsc --noEmit` + `npm run lint` + `npm run build`
2. 静态全过后，用 Agent 工具派 `subagent_type=tester` 执行端到端
3. tester 返回报告：
   - 全绿 → 告诉用户"静态 ✓ + 端到端 ✓，请审核视觉与语气"后等用户最终确认
   - 有失败 → 先基于报告尝试修，再跑一轮 tester，最多迭代 2-3 轮；仍失败则把报告原样交用户判断
4. 用户最终通过后再 commit

跳过 tester 直接让用户手测 = 违反协议。
纯文档/配置改动（不碰 `src/`）可跳过 tester，但仍需跑静态。
</after_code_change>

<test_case_maintenance>
新增或修改功能时，同步维护 `tests/e2e/cases/`：

- 新增功能 → 新增对应 case md（参考 `tests/e2e/cases/README.md` 的格式）
- 删除功能 → 删除对应 case 或调整期望
- 断言频繁误报 → 收紧期望描述（改成结构性断言，避免依赖 AI 具体措辞）

case 清单变化要在 STATUS.md 留一笔，方便跨会话追踪。
</test_case_maintenance>
