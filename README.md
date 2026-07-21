# AI Math Coach · 2026-07-21 Backup

这是“小学 4—6 年级 AI 拍题讲解”竞品研究与复刻 Demo 的完整工作备份。

## 目录

- `demo/`：可运行的拍题讲解 Demo、神经语音素材、OCR、视觉 QA 截图和实现说明。
- `research/`：竞品逐帧分析、视频取证帧、产品审计和素材裁切脚本。

## 换电脑后恢复

```bash
git clone --branch backup/ai-math-coach-2026-07-21 --single-branch \
  git@github.com:JinxinSun/new-brainstorming.git \
  ai-math-coach-backup
cd ai-math-coach-backup/demo
npm install
python3 server.py 4173
```

访问 <http://127.0.0.1:4173/>。

macOS 上如需重新编译本地 OCR：

```bash
swiftc scripts/ocr_problem.swift -framework Vision -framework AppKit -o scripts/ocr_problem
```

## 关键文档

- `demo/README.md`：Demo 功能与运行方式。
- `demo/design-qa.md`：390 × 844 视觉和交互验收报告。
- `research/current-clone-audit.md`：本轮竞品讲题流程审计。
- `research/competitor-product-audit.md`：较完整的竞品产品分析。

本分支是独立备份分支，不修改 `new-brainstorming` 的主分支。
