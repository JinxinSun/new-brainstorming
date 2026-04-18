# 01-initial-load: 首次加载与页面骨架

## 前置

- 浏览器干净会话（无 localStorage、无 cookie）
- dev server 已在 localhost:3000 运行

## 步骤

1. 导航到 `http://localhost:3000`
2. 等页面完全加载（DOMContentLoaded + 首屏 AI 气泡出现）
3. 截图记录初始状态（文件名 `01-initial-load-start-<timestamp>.png`，存入 artifacts 目录仅当失败时保留）

## 期望

- 页面成功返回 200
- 可见进度条区域，当前激活项对应 `understand_background` 阶段（阶段文本可能是"了解背景"或类似中文）
- 可见左侧对话面板，含一条 AI 消息气泡（头像"AI"可见）
- 该气泡内含以下所有要素：
  - 非空中文文字（含"需求探索师"字样 —— 这是硬编码欢迎语，稳定）
  - 不应出现开场单选按钮（不应有"全新的功能或页面"、"改造现有的功能"、"其他"三张选项卡）
- 可见右侧预览面板（可能显示欢迎/引导内容，允许为空白展位）
- 可见底部输入框（placeholder 引导用户用一句话描述功能、流程或问题）
- 无 JS 报错（console.error 数 = 0；allow warning）

## 通过标准

进度条起点正确、欢迎气泡是开放式引导、没有开场选项卡、输入框可见、无 console.error。
