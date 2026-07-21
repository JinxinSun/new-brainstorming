#!/usr/bin/env python3
"""Generate the fixed neural tutor clips and word-timing manifest for the demo."""

import argparse
import asyncio
import json
from pathlib import Path

import edge_tts


VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "-8%"
PITCH = "-2Hz"
VOLUME = "+0%"

CLIPS = {
    "clone-intro": "你好呀同学，我们一起来看看这道题。题目是，一桶油用去四分之一后，还剩三十六升。这桶油原来有多少升？",
    "clone-type": "这是一道分数应用题。解决这类问题的关键，是找准单位一，找出对应量和对应分率。",
    "clone-concept": "在这道题里，我们把这桶油原来的总量看作单位一。用去了总量的四分之一，那么剩下的油占总量的几分之几呢？",
    "clone-correct": "完全正确！",
    "clone-wrong": "再想一想。用去的是四分之一，剩下的应该比四分之一更多。你可以重新选择。",
    "clone-step-one": "题目告诉我们，剩下的三十六升就是对应量。它对应的分率是一减四分之一，等于四分之三。",
    "clone-checkpoint": "我们已经算出，剩下的油占总量的四分之三。你明白了吗？",
    "clone-continue": "好的，我们继续。现在我们知道了三十六升对应的分率是四分之三，求单位一的量，用除法。",
    "clone-calculate": "三十六除以四分之三，等于三十六乘三分之四，最后结果是四十八升。",
    "clone-summary": "分数应用题，首先要找准单位一，然后找到已知数量对应的分率，最后用除法求出单位一的量。",
    "clone-interruption": "没关系。你随时可以打断我。我们先停在这里，你可以用语音或打字告诉我哪一步没听懂。",
    "clone-typed-reply": "你问得很好。因为三十六升只是总量的四分之三，要求完整的单位一，就要用对应数量除以对应分率。",
    "intro-ready": "我们先一起把题目读一遍。",
    "intro-used": "一桶油，用去四分之一后。",
    "intro-remain": "还剩三十六升。",
    "intro-question": "问题是，这桶油原来有多少升？",
    "intro-knowns": "先看已知条件。我们知道用去的是四分之一，剩下的是三十六升，要找的是原来的总量。",
    "intro-type": "这是一道分数应用题。更准确地说，是已知部分求总量。",
    "intro-key": "解题的关键，是先找到三十六升对应总量的几分之几，再用对应数量除以对应分率，求出单位一。",
    "meaning-question": "先确认一下题意。三十六升说的是哪一部分？",
    "meaning-correct": "对，三十六升是用去之后剩下的油。",
    "meaning-used": "题目说，还剩三十六升。所以三十六升不是用去的油。",
    "meaning-total": "三十六升不是原来的整桶油，它是用去之后剩下的数量。",
    "meaning-unsure": "盯住，还剩，两个字。它告诉我们三十六升表示剩下的油。",
    "relation-question": "把原来整桶油看作单位一。用去四分之一后，还剩总量的几分之几？",
    "relation-correct": "对。整桶平均分成四份，用去一份，还剩三份，所以是四分之三。",
    "relation-used": "四分之一是用去的部分。我们现在要找剩下的部分。",
    "relation-quantity": "三十六升是一个具体数量，不是分率。题目问的是它占整桶油的几分之几。",
    "relation-unsure": "画成四份，划掉一份，再数一数还剩几份。",
    "method-question": "现在知道，总量的四分之三是三十六升。要求原来的总量，应该怎样列式？",
    "method-correct": "对。三十六升对应四分之三，求单位一，用三十六除以四分之三。",
    "method-multiply": "先估一估。原来的油应该比三十六升多。三十六乘四分之三等于二十七，反而变小了，所以不能用乘法。",
    "method-used": "三十六升对应的是剩下的四分之三，不是用去的四分之一。除数要和三十六升对应。",
    "method-unsure": "已知一个数的四分之三是三十六，求这个数，要用三十六除以四分之三。",
    "calculate-question": "算式已经列好。请你自己算一算，三十六除以四分之三等于多少？",
    "calculate-correct": "四十八。算对了。",
    "calculate-twenty-seven": "二十七是三十六乘四分之三的结果。你把除法又算成了乘法。原来的总量应该比三十六大。",
    "calculate-small": "先用大小检查。我们求的是原来的总量，答案应该比三十六升大。",
    "calculate-retry": "列式是对的。再检查除以分数这一步。三十六除以四分之三，等于三十六乘几分之几？",
    "reciprocal-question": "除以四分之三，可以乘它的倒数。四分之三的倒数是哪一个？",
    "reciprocal-correct": "对，四分之三的倒数是三分之四。现在计算三十六乘三分之四。",
    "reciprocal-same": "倒数要把分子和分母交换。四分之三不能保持不变。",
    "reciprocal-quarter": "只把分子变成一还不够。把四分之三上下交换一次。",
    "reciprocal-unsure": "倒数就是把分子和分母交换。所以四分之三会变成三分之四。",
    "answer-question": "最后，按照题目问法，把答案说完整。别忘了单位。",
    "answer-unit": "数字已经对了。再补上单位，升，把答案说完整。",
    "answer-retry": "回看刚才算出的结果。原来有四十八升。再按照题目问法作答。",
    "complete-summary": "你自己完成了这道题。已知总量的几分之几是多少，求总量，就用对应数量除以对应分率。最后再倒推检查。",
}


def add_caption_fragments(source, boundaries):
    """Reinsert punctuation omitted by word-boundary events."""
    cursor = 0
    cues = []
    for boundary in boundaries:
        word = boundary["text"]
        word_start = source.find(word, cursor)
        if word_start < 0:
            fragment = word
        else:
            word_end = word_start + len(word)
            fragment = source[cursor:word_end]
            cursor = word_end
        cues.append(
            {
                "startMs": round(boundary["offset"] / 10_000),
                "endMs": round((boundary["offset"] + boundary["duration"]) / 10_000),
                "text": fragment,
            }
        )

    if cues and cursor < len(source):
        cues[-1]["text"] += source[cursor:]
    return cues


async def generate_clip(clip_id, text, output_dir, semaphore):
    output_path = output_dir / f"{clip_id}.mp3"
    temp_path = output_dir / f".{clip_id}.mp3.part"

    async with semaphore:
        for attempt in range(1, 4):
            boundaries = []
            try:
                communicator = edge_tts.Communicate(
                    text,
                    VOICE,
                    rate=RATE,
                    volume=VOLUME,
                    pitch=PITCH,
                    boundary="WordBoundary",
                )
                with temp_path.open("wb") as audio_file:
                    async for message in communicator.stream():
                        if message["type"] == "audio":
                            audio_file.write(message["data"])
                        elif message["type"] == "WordBoundary":
                            boundaries.append(message)

                if not boundaries:
                    raise RuntimeError("No word timings returned")
                temp_path.replace(output_path)
                return clip_id, {
                    "speech": text,
                    "cues": add_caption_fragments(text, boundaries),
                }
            except Exception:
                temp_path.unlink(missing_ok=True)
                if attempt == 3:
                    raise
                await asyncio.sleep(attempt * 1.5)


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "assets" / "audio",
    )
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)

    semaphore = asyncio.Semaphore(3)
    results = await asyncio.gather(
        *(generate_clip(clip_id, text, args.output, semaphore) for clip_id, text in CLIPS.items())
    )
    manifest = {
        "provider": "edge-tts",
        "voice": VOICE,
        "rate": RATE,
        "pitch": PITCH,
        "clips": dict(results),
    }
    (args.output / "timings.json").write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Generated {len(results)} neural clips in {args.output}")


if __name__ == "__main__":
    asyncio.run(main())
