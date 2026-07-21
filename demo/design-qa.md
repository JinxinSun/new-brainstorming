# Design QA

## Comparison target

- Source visual truth:
  - `/Users/king/code/video-audit/current-evidence/01-0008.9s.png`
  - `/Users/king/code/video-audit/current-evidence/05-0042.9s.png`
  - `/Users/king/code/video-audit/current-evidence/10-0074.3s.png`
  - `/Users/king/code/video-audit/current-evidence/16-0117.3s.png`
- Browser-rendered implementation:
  - `/Users/king/code/ai-math-coach-demo/qa-clone/01-capture-latest.png`
  - `/Users/king/code/ai-math-coach-demo/qa-clone/03-quiz-latest.png`
  - `/Users/king/code/ai-math-coach-demo/qa-clone/04-checkpoint-latest.png`
  - `/Users/king/code/ai-math-coach-demo/qa-clone/05-final-latest.png`
- Viewport: 390 × 844 CSS pixels.
- States: capture/crop, understanding quiz, first-step checkpoint, completed answer.
- Runtime URL: `http://127.0.0.1:4173/`.

## Full-view comparison evidence

The reference and implementation were normalized to the same 390 × 844 viewport and placed together in the same comparison images:

- `/Users/king/code/ai-math-coach-demo/qa-clone/compare-01-capture.png`
- `/Users/king/code/ai-math-coach-demo/qa-clone/compare-02-quiz.png`
- `/Users/king/code/ai-math-coach-demo/qa-clone/compare-03-checkpoint.png`
- `/Users/king/code/ai-math-coach-demo/qa-clone/compare-04-final.png`

Focused region comparison was not needed after the final pass: these original-resolution paired mobile frames keep the question typography, fractions, cards, avatar, controls and answer choices readable. The quiz pair also functions as a focused check of the highest-density interactive region.

## Findings

No actionable P0, P1 or P2 mismatch remains in the four target states.

- Fonts and typography: PingFang/system fallbacks, weights, line heights, two-line question wrapping and stacked textbook fractions match the source hierarchy. Spoken fractions use denominator-first Chinese wording.
- Spacing and layout rhythm: question, type, key card, step cards, answer and persistent bottom controls align to the source proportions. The quiz inner width and line wrapping were corrected to the source.
- Colors and tokens: off-white question surface, peach key card, blue formula cards, green answer card and semantic wrong/correct states follow the source palette.
- Image quality and asset fidelity: the worksheet camera view and teacher avatar are raster crops from the supplied competitor footage. No emoji, CSS drawing, inline SVG or placeholder image substitutes remain. Interface icons use one real icon family.
- Copy and content: the app-specific labels follow the competitor flow; the uploaded question is not preceded by an invented “和老师一起读题” step.
- Accessibility: controls are semantic buttons with accessible names, fractions expose Chinese aria labels, the photo has alt text, and tap targets remain practical at 390 px.
- Responsiveness: at the target viewport, `innerWidth`, document width and body width are all 390 px; there is no horizontal overflow.

Residual P3 differences: status-bar glyph antialiasing and a few one-to-three-pixel optical offsets differ from compressed video frames. These do not change hierarchy or interaction.

## Comparison history

### Pass 1 — blocked

- [P1] The first clone used a different generated teacher avatar rather than the source asset.
- [P1] The final method summary and live transcript overlapped, producing duplicate text.
- [P2] The key-card hue and quiz answer-sheet proportions drifted from the source.

Fixes: cropped the exact teacher avatar from the current source frame; suppressed the redundant footer transcript while the main summary streams; remapped the peach key token and quiz gradient.

Post-fix evidence: `compare-02-quiz.png` and `compare-04-final.png`.

### Pass 2 — blocked

- [P2] Quiz choices were too wide, so the question wrapped differently from the competitor.
- [P2] The completed method summary was washed out behind the footer gradient.

Fixes: matched the quiz card’s 20 px outer inset and 22 px inner inset; aligned the question/options vertically; placed the streamed method summary above the footer wash while keeping it below the controls.

Post-fix evidence: the current `compare-02-quiz.png` and `compare-04-final.png`.

### Pass 3 — passed

The source-cropped avatar, quiz line wrapping, option widths, checkpoint rhythm and completed summary now match without an actionable P0/P1/P2 issue.

## Functional verification

- Capture confirmation starts narration automatically: passed.
- Real file upload and macOS Vision OCR: passed with the apple problem.
- Content and voice stream together: passed.
- Wrong answer plays only new feedback, keeps the quiz open and re-enables all four choices after the clip: passed.
- Correct answer closes the quiz and resumes teaching: passed.
- Voice interruption and typed interruption stop current narration and show a resume control: passed.
- Fraction speech normalization: passed; clone speech strings contain no slash or “斜杠”.
- Complete first-step checkpoint and final-answer flow: passed.
- Browser console logs: none.
- Browser-rendered screenshots: present for every primary state.

## Follow-up polish

- P3: if production must reproduce the captured iPhone status bar exactly, replace the platform-simulated glyph row with a licensed/device-native shell rather than further CSS approximation.

final result: passed
