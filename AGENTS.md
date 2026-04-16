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
