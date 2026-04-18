# 02-basic-conversation: 多轮文字对话 + 无空白气泡

**回归意图**：STATUS.md 曾记录 "空白气泡" bug（AI 只调工具不输出文字时气泡内容为空）。prompts.ts 加了"铁律"节 + QuestionCard 加了空内容兜底。本 case 重演那个场景，确认不再复现。

## 前置

- 完成 01-initial-load 检查
- 浏览器已在 localhost:3000

## 步骤

1. 在底部输入框输入文字：`我想做一个管理司机卡 ID 的功能`，点击发送（或按 Enter）
2. 等待 AI 流式回复完成（观察气泡流式光标消失、下一轮输入框恢复可用 isLoading=false）
3. 读取此时 AI 回复气泡的文字内容，暂存为 `reply1`
4. 根据 AI 的追问，再发一条自然承接的用户回答：`主要是内部业务人员用，想替换现在乱的 Excel 管理`
5. 等 AI 回复完成，读取气泡文字 `reply2`
6. 再发一条：`现在最头疼的是换司机时老找不到历史卡 ID`
7. 等 AI 回复完成，读取气泡文字 `reply3`
8. 失败则截图存 artifacts

## 期望

- 三轮 AI 回复（`reply1`、`reply2`、`reply3`）每一轮都满足：
  - 气泡的 `.prose` 内非空白文字字符数 ≥ 10
  - 气泡内存在渲染出的文本段落（至少一个 `<p>` 或 `<li>` 元素含非空 textContent）
  - 气泡不是"只有选项按钮、没有上方文字"的样子
- 浏览器 DevTools Console 中**不应出现**：
  - `[brainstorm] fallback: drop choices on empty assistant content`
  - `[brainstorm] fallback: prototype updated without assistant text`
  （出现任意一条 → 视为空白气泡兜底被触发 → 失败，附控制台日志）
- 三轮对话总字符增加趋势（`reply1 < reply1+reply2` 累计），至少整体大于 50 字符
- 对话过程中无 toast 错误、无"请求失败"红字提示

## 通过标准

三轮对话都有可见文字输出；无空白气泡兜底 console 警告。
