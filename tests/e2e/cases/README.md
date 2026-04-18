# E2E 测试用例

本目录下的每个 `*.md` 都是一个端到端冒烟用例。`.claude/agents/tester.md` 定义的 tester subagent 会按字典序执行这些用例，用 Playwright MCP 驱动真实浏览器、真实 OpenAI 调用。

## 用例格式

```markdown
# <case-id>: <场景名>

## 前置
- <环境/状态要求，比如"首次访问"或"已完成 case X">

## 步骤
1. <具体操作，使用文字/角色匹配而非 CSS 选择器>
2. ...

## 期望
- <结构性断言，避免依赖 AI 输出的具体措辞>
- ...

## 通过标准
<一句话概括，方便 tester 汇报>
```

## 断言原则

**结构性 > 措辞性**。每次 AI 输出不一样，不要断言具体文字。改成：

- ✅ "AI 回复气泡的 `.prose` 内含至少 20 个非空字符"
- ❌ "AI 说了'好的，我记下来了'"
- ✅ "页面存在 role=button 的可见选项，数量 ≥ 2"
- ❌ "页面有按钮'继续'和'返回'"
- ✅ "进度条当前激活项 aria-label 含 `understand_background`"
- ❌ "进度条显示'了解背景'"

**容忍非确定性**：同一个 case 第二次跑，AI 措辞可能完全不同。期望应该对两次都成立。

## 新增用例

1. 起个新 id（当前最大 + 1，补零到 2 位）
2. 从需求文档 `require/brainstorm-web-requirements_v3.md` 或真实手测发现的 bug 出发
3. 步骤要"一个普通用户能按着走"——点什么、输什么、看什么
4. 期望聚焦**本 case 想验证的那件事**，其它方面走过场即可
5. 建完在 `.claude/STATUS.md` 留一条"新增 case XX：<场景>"

## 当前用例清单

| 文件 | 覆盖点 |
|---|---|
| 01-initial-load.md | 首次加载、欢迎消息、左右分栏、进度条起点 |
| 02-basic-conversation.md | 多轮文字对话、流式输出、无空白气泡 |
| 03-choice-card-interaction.md | 选项卡渲染 + 点击 + 开放输入仍可用 |
| 04-prototype-offer-flow.md | stage 1-3 原型 offer 先问再画；stage 4+ 默认画 |
| 05-approach-branching.md | 真分叉时给 2-3 方案 + 领头推荐 |
| 06-stage-progression.md | stage 依次推进、进度条正确；允许回退 |
| 07-stage-6-summary.md | stage=output_result 时产出 4 节 Markdown 需求摘要 |
| 08-image-upload.md | 改造场景：上传截图 + AI 描述页面 |
| 09-consultative-management-feature.md | 普通管理功能先归纳，不把基础动作拆成问卷 |
| 10-correction-first.md | 用户纠错后先修正理解 |
| 11-assumption-progress.md | 信息足够时假设推进 |
| 12-conceptual-ui-no-prototype.md | UI 相关但概念性问题不自动出原型 |
| 13-single-key-gap.md | 单轮只推进一个关键点 |
| 14-scope-decomposition.md | 多独立子系统先拆分范围 |
