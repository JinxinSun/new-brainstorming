/**
 * 从客户角度测试"需求探索师"应用的 UX 测试脚本
 * 运行：node test-ux.mjs
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = '/tmp/ux-test-screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let stepIndex = 0;
async function screenshot(page, label) {
  stepIndex++;
  const filename = `${String(stepIndex).padStart(2, '0')}-${label}.png`;
  const filepath = join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`📸 [${stepIndex}] ${label} → ${filepath}`);
  return filepath;
}

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const issues = [];
  const observations = [];

  console.log('\n=== 需求探索师 UX 测试开始 ===\n');

  // ── 步骤 1：打开首页 ──────────────────────────────────────
  console.log('▶ 步骤 1：打开首页');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
  } catch {
    console.error('❌ 无法访问 localhost:3000，请确认服务已启动');
    await browser.close();
    process.exit(1);
  }
  await screenshot(page, 'homepage-initial');
  observations.push('首页加载成功');

  // ── 步骤 2：等待 AI 开场消息 ──────────────────────────────
  console.log('▶ 步骤 2：等待 AI 开场消息流式输出');
  try {
    // 等待消息气泡出现
    await page.waitForSelector('[class*="rounded-2xl"]', { timeout: 20000 });
    await wait(3000); // 等待流式输出稳定
    await screenshot(page, 'ai-greeting-streaming');

    // 等待流式结束（isStreaming 结束后选项卡片出现）
    await page.waitForSelector('button[class*="rounded-xl"]', { timeout: 30000 });
    await wait(500);
    await screenshot(page, 'ai-greeting-with-choices');

    const choicesCount = await page.locator('button[class*="rounded-xl"]').count();
    observations.push(`AI 开场消息正常，显示了 ${choicesCount} 个选项卡片`);
    console.log(`  ✓ 出现 ${choicesCount} 个选项`);
  } catch {
    issues.push('❌ AI 开场消息未在 30s 内出现，可能是 API Key 问题或网络超时');
    await screenshot(page, 'error-no-greeting');
    console.error('  ❌', e.message);
  }

  // ── 步骤 3：检查进度条 ────────────────────────────────────
  console.log('▶ 步骤 3：检查顶部进度条');
  const progressBar = await page.locator('.border-b').first();
  const progressVisible = await progressBar.isVisible();
  if (progressVisible) {
    const stageText = await progressBar.innerText();
    observations.push(`进度条可见，内容：${stageText.replace(/\s+/g, ' ').trim()}`);
    console.log('  ✓ 进度条可见');
  } else {
    issues.push('⚠️ 进度条不可见');
  }

  // ── 步骤 4：点击第一个选项卡片 ───────────────────────────
  console.log('▶ 步骤 4：点击第一个选项卡片（模拟用户选择）');
  try {
    const firstChoice = page.locator('button[class*="rounded-xl"]').first();
    const choiceText = await firstChoice.innerText();
    console.log(`  → 点击选项：${choiceText.trim()}`);
    await firstChoice.click();
    await screenshot(page, 'after-choice-click');
    observations.push(`点击了选项卡片：${choiceText.trim().substring(0, 30)}`);

    // 等待新一轮 AI 回复
    await wait(2000);
    await screenshot(page, 'waiting-ai-response');

    // 等待 loading 结束（isLoading=false 后输入框重新可用）
    await page.waitForSelector('textarea:not([disabled])', { timeout: 30000 });
    await wait(500);
    await screenshot(page, 'ai-second-response');
    observations.push('AI 第二轮响应正常');
    console.log('  ✓ AI 第二轮响应完成');
  } catch {
    issues.push('❌ 选项卡片点击后 AI 未响应或超时');
    console.error('  ❌', e.message);
  }

  // ── 步骤 5：手动输入文字 ──────────────────────────────────
  console.log('▶ 步骤 5：手动输入文字测试');
  try {
    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.fill('我想做一个企业内部的请假审批系统，让员工可以在手机上申请请假，主管审批');
    await screenshot(page, 'user-typing');

    // 检查发送按钮状态
    const sendBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    const isSendEnabled = await sendBtn.isEnabled();
    if (isSendEnabled) {
      observations.push('输入文字后发送按钮激活正常');
    } else {
      issues.push('⚠️ 输入文字后发送按钮仍然禁用');
    }

    // Enter 发送
    await textarea.press('Enter');
    await wait(1000);
    await screenshot(page, 'after-user-message-sent');

    // 等待 AI 回复
    await page.waitForSelector('textarea:not([disabled])', { timeout: 40000 });
    await wait(500);
    await screenshot(page, 'ai-response-to-user-input');
    observations.push('手动输入后 AI 正常响应');
    console.log('  ✓ 手动输入 + AI 响应正常');
  } catch {
    issues.push('❌ 手动输入测试失败：' + e.message);
    console.error('  ❌', e.message);
  }

  // ── 步骤 6：测试图片上传按钮 ─────────────────────────────
  console.log('▶ 步骤 6：检查图片上传按钮');
  try {
    const imgBtn = page.locator('button[title="上传图片"]');
    const imgBtnVisible = await imgBtn.isVisible();
    if (imgBtnVisible) {
      observations.push('图片上传按钮可见');
      console.log('  ✓ 图片上传按钮可见');
    } else {
      issues.push('⚠️ 图片上传按钮不可见');
    }
  } catch {
    issues.push('⚠️ 图片上传按钮检查失败');
  }

  // ── 步骤 7：检查右侧预览区域 ─────────────────────────────
  console.log('▶ 步骤 7：检查右侧预览区域');
  try {
    const iframe = page.locator('iframe[title="原型预览"]');
    const iframeVisible = await iframe.isVisible().catch(() => false);
    const welcomeGuide = page.locator('text=需求探索工作台');
    const guideVisible = await welcomeGuide.isVisible().catch(() => false);

    if (iframeVisible) {
      observations.push('右侧已显示原型预览 iframe');
      console.log('  ✓ 已生成原型预览');
    } else if (guideVisible) {
      observations.push('右侧显示欢迎引导页（原型尚未生成）');
      console.log('  ✓ 显示欢迎引导页（正常，原型还未生成）');
    } else {
      issues.push('⚠️ 右侧预览区域状态不明');
    }
    await screenshot(page, 'preview-panel-state');
  } catch {
    issues.push('⚠️ 预览区域检查失败');
  }

  // ── 步骤 8：测试 Shift+Enter 换行 ────────────────────────
  console.log('▶ 步骤 8：测试 Shift+Enter 换行（不发送）');
  try {
    await page.waitForSelector('textarea:not([disabled])', { timeout: 10000 });
    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.fill('第一行');
    await textarea.press('Shift+Enter');
    await textarea.type('第二行');
    const value = await textarea.inputValue();
    if (value.includes('\n')) {
      observations.push('Shift+Enter 换行功能正常');
      console.log('  ✓ Shift+Enter 换行正常');
    } else {
      issues.push('⚠️ Shift+Enter 可能触发了发送而不是换行');
    }
    // 清空
    await textarea.fill('');
    await screenshot(page, 'shift-enter-test');
  } catch {
    issues.push('⚠️ 换行测试失败');
  }

  // ── 步骤 9：继续对话到能看到原型 ─────────────────────────
  console.log('▶ 步骤 9：继续对话，尝试推进到原型生成阶段');
  try {
    // 继续回答几轮，看看能否推进到原型阶段
    const textarea = page.locator('textarea');

    // 尝试继续对话
    const rounds = [
      '员工可以填写请假类型、时间和事由，提交后主管收到通知并审批，审批结果通知员工',
    ];

    for (const msg of rounds) {
      await page.waitForSelector('textarea:not([disabled])', { timeout: 20000 });
      await textarea.click();
      await textarea.fill(msg);
      await textarea.press('Enter');
      await wait(1000);
      await page.waitForSelector('textarea:not([disabled])', { timeout: 40000 });
      await wait(500);
    }

    // 检查是否出现了 iframe（原型）
    const iframeNow = page.locator('iframe[title="原型预览"]');
    const iframeNowVisible = await iframeNow.isVisible().catch(() => false);
    if (iframeNowVisible) {
      observations.push('✅ 对话深入后原型 iframe 已生成并显示');
      console.log('  ✓ 原型 iframe 已显示');
    } else {
      observations.push('原型尚未生成（对话轮次可能还不够）');
      console.log('  ℹ️  原型尚未生成，对话轮次不足');
    }
    await screenshot(page, 'after-more-dialogue');
  } catch (e) {
    issues.push('⚠️ 深入对话测试中出现问题：' + e.message);
  }

  // ── 步骤 10：滚动和消息列表 ──────────────────────────────
  console.log('▶ 步骤 10：检查消息列表滚动和整体布局');
  await screenshot(page, 'final-state');
  const msgCount = await page.locator('[class*="rounded-2xl"]').count();
  observations.push(`消息列表共 ${msgCount} 条消息气泡`);
  console.log(`  ✓ 共 ${msgCount} 条消息气泡`);

  // ── 汇总报告 ─────────────────────────────────────────────
  await browser.close();

  console.log('\n' + '═'.repeat(60));
  console.log('📋 UX 测试汇总报告');
  console.log('═'.repeat(60));
  console.log('\n✅ 正常观察：');
  observations.forEach(o => console.log('  •', o));

  if (issues.length > 0) {
    console.log('\n⚠️  发现问题：');
    issues.forEach(i => console.log('  •', i));
  } else {
    console.log('\n🎉 未发现明显问题');
  }

  console.log(`\n📸 截图保存在：${SCREENSHOTS_DIR}`);
  console.log('═'.repeat(60) + '\n');

  // 输出机器可读的 JSON 摘要
  writeFileSync('/tmp/ux-test-result.json', JSON.stringify({ observations, issues }, null, 2));
}

main().catch(e => {
  console.error('脚本运行出错：', e);
  process.exit(1);
});
