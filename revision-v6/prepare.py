"""Prepare selected source media and a deterministic, editable documentary timeline."""
import argparse
import json
import math
import shutil
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
PREVIOUS = PROJECT / "revision-v2"
PUBLIC = ROOT / "public"
TOOLS = Path.home() / ".config/opencode/skills/ffmpeg-skill/scripts"
PYTHON = Path.home() / ".local/share/opencode/video-tools/.venv/Scripts/python.exe"
FPS = 30
RATE = 48000


def save(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=True), encoding="utf-8")


def helper(name, arguments, log):
    process = subprocess.run([str(PYTHON), str(TOOLS / name), *map(str, arguments)],
                             capture_output=True, text=True, encoding="utf-8", errors="replace")
    (ROOT / "reports" / log).write_text(process.stdout + "\n" + process.stderr, encoding="utf-8")
    if process.returncode:
        raise RuntimeError(f"{name}: {process.stdout[-3500:]} {process.stderr[-2000:]}")
    return process.stdout


def pcm(path):
    with wave.open(str(path), "rb") as source:
        assert source.getframerate() == RATE and source.getsampwidth() == 2
        return np.frombuffer(source.readframes(source.getnframes()), dtype="<i2").copy().reshape(-1, source.getnchannels()).astype(np.float32) / 32768


def wav(path, audio):
    with wave.open(str(path), "wb") as target:
        target.setnchannels(audio.shape[1] if audio.ndim == 2 else 1)
        target.setsampwidth(2)
        target.setframerate(RATE)
        target.writeframes((np.clip(audio, -0.98, 0.98) * 32767).astype("<i2").tobytes())


def timestamp(seconds):
    ms = round(seconds * 1000)
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def sentence_case(text):
    text = text.lower()
    first = next((index for index, character in enumerate(text) if character.isalpha()), 0)
    return text[:first] + text[first:first + 1].upper() + text[first + 1:]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--media", action="store_true")
    args = parser.parse_args()
    for directory in ("public/media", "public/audio", "public/fonts", "reports", "plans", "src", "out/review"):
        (ROOT / directory).mkdir(parents=True, exist_ok=True)
    for photo in (PREVIOUS / "assets").glob("p*.jpg"):
        shutil.copy2(photo, PUBLIC / "media" / photo.name)
    for font in (PREVIOUS / "fonts").glob("*.ttf"):
        shutil.copy2(font, PUBLIC / "fonts" / font.name)

    inventory = json.loads((PROJECT / "prototype-v1/inventory.json").read_text(encoding="utf-8"))
    sources = {item["id"]: item for item in inventory}
    selections = {
        "v01": (85.0, 6.0), "v13": (108.0, 6.0), "v14": (9.0, 3.0),
        "v03": (153.0, 5.0), "v05": (0.0, 2.6), "v06": (0.0, 2.6),
        "v07": (114.0, 5.0), "v08": (13.5, 5.0), "v09": (47.0, 5.0),
        "v10": (5.3, 5.0), "v11": (0.0, 5.0), "v12": (5.0, 5.0),
        "v04": (1.2, 5.0), "v02": (50.0, 4.5),
    }
    media = {}
    for key, (begin, length) in selections.items():
        item = sources[key]
        output = PUBLIC / "media" / f"{key}.mp4"
        metadata = item
        if args.media and not output.exists():
            metadata = json.loads(helper("probe.py", [item["path"], "--json"], f"source-{key}.json"))
        rotated = abs(metadata["video"]["rotation"]) % 180 == 90
        landscape = (metadata["video"]["width"] > metadata["video"]["height"]) != rotated
        width, height = (960, 540) if landscape else (540, 960)
        media[key] = {"src": f"media/{key}.mp4", "sourceIn": begin, "duration": length, "landscape": landscape}
        plan = {"output": str(output), "clips": [{"src": item["path"], "in": begin, "out": begin + length}],
                "frame": {"width": width, "height": height, "fps": FPS, "fit": "pad"}}
        plan_path = ROOT / "plans" / f"{key}.json"
        save(plan_path, plan)
        if args.media and not output.exists():
            helper("render.py", [plan_path, "--dry-run", "--json"], f"plan-{key}.json")
            print(f"Preparing {key}: {begin:.1f}s + {length:.1f}s", flush=True)
            if metadata.get("audio") is None and rotated:
                # The orchestrator misreads CSV rotation side data on silent phone clips.
                # Its dedicated cut and fit tools correctly probe these same inputs.
                cut_path = ROOT / "out" / f"{key}-selected.mp4"
                cut_args = [item["path"], "--start", begin, "--end", begin + length, "--accurate", "-o", cut_path]
                if not cut_path.exists():
                    helper("cut.py", cut_args + ["--dry-run", "--json"], f"cut-plan-{key}.json")
                    helper("cut.py", cut_args + ["--json"], f"cut-{key}.json")
                fit_args = [cut_path, "--width", width, "--height", height, "--fps", FPS, "--fit", "pad", "-o", output]
                helper("fit.py", fit_args + ["--dry-run", "--json"], f"fit-plan-{key}.json")
                helper("fit.py", fit_args + ["--json"], f"media-{key}.json")
            else:
                helper("render.py", [plan_path, "--json"], f"media-{key}.json")

    sections = []
    cursor = 0

    def scene(key, kind, seconds, **data):
        nonlocal cursor
        frames = round(seconds * FPS)
        result = {"id": key, "kind": kind, "from": cursor, "frames": frames, **data}
        sections.append(result)
        cursor += frames
        return result

    scene("opening", "opening", 7)
    scene("chemistry", "chemistry", 18)
    scene("physics", "physics", 18)
    scene("prototype", "prototype", 16)
    scene("first-test", "trial", 6, source="v01", attempt=1, stage=1)
    scene("second-test", "trial", 6, source="v13", attempt=2, stage=1)
    scene("first-launch", "trial", 3, source="v14", attempt=3, stage=1, original=True)
    scene("first-replay", "trial", 4, source="v14", attempt=3, stage=1, replay=True, trim=0.55, speed=0.4)
    scene("first-result", "result", 5)
    scene("diagnosis", "diagnosis", 12)
    scene("rebuild", "rebuild", 18)
    scene("second-stage", "chapter", 2)
    for index, key in enumerate(("v03", "v05", "v06", "v07", "v08", "v09", "v10", "v11", "v12", "v04"), 1):
        scene(f"attempt-{index:02d}", "trial", selections[key][1], source=key, attempt=index, stage=2)
    scene("second-launch", "trial", 4.5, source="v02", attempt=11, stage=2, original=True)
    scene("second-replay", "trial", 4.5, source="v02", attempt=11, stage=2, replay=True, trim=0.7, speed=0.4)
    duration = cursor / FPS
    by_id = {item["id"]: item for item in sections}

    # Reuse the established Spanish performance and copy; new source code stays English.
    report = json.loads((PREVIOUS / "first-person/narration-report.json").read_text(encoding="utf-8"))
    raw_words = json.loads((PREVIOUS / "first-person/words.json").read_text(encoding="utf-8"))["words"]
    raw_audio = pcm(PREVIOUS / "first-person/voice.wav")[:, 0]
    line_words, word_cursor = [], 0
    for line in report["lines"]:
        count = len(line["text"].split())
        line_words.append(raw_words[word_cursor:word_cursor + count])
        word_cursor += count
    assert word_cursor == len(raw_words)
    placements = [(0, "opening", 0.7), (1, "chemistry", 0.8), (2, "chemistry", 6.0),
                  (3, "chemistry", 11.5), (4, "physics", 0.8), (5, "physics", 6.1),
                  (6, "physics", 11.3), (7, "prototype", 0.7), (8, "prototype", 5.4),
                  (9, "prototype", 10.3), (10, "first-test", 0.5), (11, "second-test", 0.5),
                  (29, "first-result", 0.3), (13, "diagnosis", 0.6), (14, "diagnosis", 6.4),
                  (15, "rebuild", 0.8), (16, "rebuild", 6.3), (17, "rebuild", 11.8)]
    placements += [(18 + index, f"attempt-{index + 1:02d}", 0.25) for index in range(10)]
    # Success words follow the measured release transient, rather than a later photo.
    # The first comment continues into the replay on the same chronological timeline.
    placements += [(12, "first-launch", 1.8 - (line_words[12][5]["start"] - (line_words[12][0]["start"] - 0.06))),
                   (12, "first-replay", 2.4 - (line_words[12][8]["start"] - (line_words[12][6]["start"] - 0.06))),
                   (28, "second-launch", 1.48 - (line_words[28][6]["start"] - (line_words[28][0]["start"] - 0.06)))]
    word_ranges = {"opening": (0, 6), "first-launch": (0, 6), "first-replay": (6, None)}
    voice = np.zeros(round(duration * RATE), dtype=np.float32)
    words, voice_events = [], []
    for index, key, offset in placements:
        subset = line_words[index][:2] if 18 <= index <= 27 else line_words[index]
        if key in word_ranges:
            first, last = word_ranges[key]
            subset = subset[first:last]
        source_start = max(0, subset[0]["start"] - 0.06)
        source_end = subset[-1]["end"] + 0.09
        last_word = line_words[index].index(subset[-1])
        if last_word + 1 < len(line_words[index]):
            source_end = min(source_end, line_words[index][last_word + 1]["start"] - 0.004)
        clip = raw_audio[round(source_start * RATE):round(source_end * RATE)].copy()
        envelope_length = min(240, len(clip) // 8)
        clip[:envelope_length] *= np.linspace(0, 1, envelope_length)
        clip[-envelope_length:] *= np.linspace(1, 0, envelope_length)
        target = by_id[key]["from"] / FPS + offset
        position = round(target * RATE)
        assert position + len(clip) <= round((by_id[key]["from"] + by_id[key]["frames"]) / FPS * RATE)
        voice[position:position + len(clip)] += clip
        voice_events.append({"line": index, "scene": key, "sourceStart": source_start, "sourceEnd": source_end,
                             "start": target, "end": target + len(clip) / RATE})
        for word in subset:
            words.append({"text": word["w"], "start": target + word["start"] - source_start,
                          "end": target + word["end"] - source_start})
    words.sort(key=lambda item: item["start"])
    voice_events.sort(key=lambda item: item["start"])
    wav(PUBLIC / "audio/voice.wav", voice)

    # Original launch audio is source-aligned and never replaced by an invented launch effect.
    originals = np.zeros((len(voice), 2), dtype=np.float32)
    for key, name in (("first-launch", "first-success-original.wav"), ("second-launch", "second-success-original.wav")):
        segment = by_id[key]
        clip = pcm(PREVIOUS / "assets" / name)[:round(segment["frames"] / FPS * RATE)]
        start = round(segment["from"] / FPS * RATE)
        originals[start:start + len(clip)] += clip * 0.65
    wav(PUBLIC / "audio/location.wav", originals)

    # A brighter, lightly percussive original underscore follows the new maker-film direction.
    rng = np.random.default_rng(731)
    music = np.zeros((len(voice), 2), dtype=np.float32)
    beat = 60 / 104
    chord_notes = ((130.813, 164.814, 196.0, 261.626), (174.614, 220.0, 261.626, 349.228),
                   (110.0, 164.814, 220.0, 261.626), (146.832, 196.0, 246.942, 293.665))
    for bar_start in np.arange(0, duration, beat * 8):
        length = min(round((beat * 8 + 0.5) * RATE), len(voice) - round(bar_start * RATE))
        t = np.arange(length, dtype=np.float32) / RATE
        amp = np.minimum(1, t / 0.9) * np.minimum(1, (length / RATE - t) / 1.3)
        notes = chord_notes[int(bar_start / (beat * 8) + 0.1) % 4]
        buffer = np.zeros((length, 2), dtype=np.float32)
        for note_index, note in enumerate(notes):
            buffer[:, 0] += np.sin(2 * np.pi * note * t) * amp * 0.006
            buffer[:, 1] += np.sin(2 * np.pi * note * 1.0012 * t + 0.1) * amp * 0.006
        start = round(bar_start * RATE)
        music[start:start + length] += buffer
    for number, at in enumerate(np.arange(0, duration, beat)):
        length = min(round(0.7 * RATE), len(voice) - round(at * RATE))
        t = np.arange(length, dtype=np.float32) / RATE
        note = chord_notes[(number // 8) % 4][number % 4] * 2
        tone = (np.sin(2 * np.pi * note * t) + 0.25 * np.sin(2 * np.pi * note * 2 * t)
                + 0.09 * np.sin(2 * np.pi * note * 3 * t)) * np.exp(-t * 9) * 0.030
        tone *= np.minimum(1, t / 0.012)
        pos = round(at * RATE)
        music[pos:pos + length, number % 2] += tone
        music[pos:pos + length, 1 - number % 2] += tone * 0.45
        if number % 2 == 0:
            kick = np.sin(2 * np.pi * (48 * t + 9 * (1 - np.exp(-t * 30)))) * np.exp(-t * 15) * 0.030
            music[pos:pos + length] += kick[:, None]
        else:
            noise = rng.normal(0, 1, length).astype(np.float32)
            snap = np.diff(noise, prepend=0) * np.exp(-t * 45) * np.minimum(1, t / 0.006) * 0.0035
            music[pos:pos + length] += snap[:, None]
    # Speech-controlled ducking uses a fast envelope rather than an expensive long convolution.
    block = 480
    activity = np.array([np.sqrt(np.mean(voice[i:i + block] ** 2)) for i in range(0, len(voice), block)])
    target_duck = np.where(activity > 0.008, 0.28, 0.8)
    smooth, value = [], 0.8
    for level in target_duck:
        value += (level - value) * (0.65 if level < value else 0.025)
        smooth.append(value)
    duck = np.repeat(np.array(smooth, dtype=np.float32), block)[:len(voice)]
    for key in ("first-launch", "second-launch"):
        item = by_id[key]
        duck[round(item["from"] / FPS * RATE):round((item["from"] + item["frames"]) / FPS * RATE)] *= 0.12
    music *= duck[:, None]
    music[:RATE] *= np.linspace(0, 1, RATE)[:, None]
    # A short technical tail prevents a click while leaving the edit musically open.
    music[-round(0.15 * RATE):] *= np.linspace(1, 0, round(0.15 * RATE))[:, None]
    wav(PUBLIC / "audio/music.wav", music)
    effects = np.zeros((len(voice), 2), dtype=np.float32)
    for item in sections:
        if item.get("original") or item.get("replay"):
            continue
        at = max(0, item["from"] / FPS - 0.08)
        length = min(round(0.32 * RATE), len(voice) - round(at * RATE))
        t = np.arange(length, dtype=np.float32) / RATE
        noise = rng.normal(0, 1, length).astype(np.float32)
        noise = np.convolve(noise, np.ones(12, dtype=np.float32) / 12, mode="same")
        sweep = noise * np.sin(np.pi * t / (length / RATE)) ** 2 * 0.012
        pos = round(at * RATE)
        effects[pos:pos + length] += sweep[:, None]
    wav(PUBLIC / "audio/effects.wav", effects)
    mix = np.repeat(voice[:, None], 2, axis=1) + originals + music + effects
    wav(ROOT / "out/mix.wav", mix)

    content = json.loads((PROJECT / "prototype-v1/content.json").read_text(encoding="utf-8"))
    dictionary = {item["id"]: {"title": sentence_case(item["title"])} for item in content
                  if item["id"] not in ("status", "closing")}
    dictionary["opening"]["tagline"] = dictionary["opening"]["title"]
    dictionary["opening"]["title"] = (line_words[0][0]["w"] + " " + line_words[0][-1]["w"]).upper()
    dictionary["name"] = " ".join(report["lines"][0]["text"].split()[3:6])
    # Existing narrated words provide the visual language without a new translation pass.
    dictionary["attempt"] = line_words[18][0]["w"]
    dictionary["gas"] = " ".join(word["w"] for word in line_words[2][4:7]).strip(".,")
    dictionary["ingredients"] = [line_words[1][6]["w"].strip(".,"), " ".join(word["w"] for word in line_words[1][8:11]).strip(".,")]
    dictionary["pressure"] = line_words[5][1]["w"].strip(".,")
    dictionary["reaction"] = line_words[5][9]["w"].strip(".,")
    dictionary["water"] = line_words[5][4]["w"].strip(".,")
    dictionary["diagnosisItems"] = [" ".join(word["w"] for word in line_words[13][a:b]).strip(".,") for a, b in ((4, 6), (6, 9), (10, 12))]
    dictionary["secondStage"] = " ".join(content[7]["text"].split()[1:3])
    dictionary["firstSuccess"] = chr(161) + " ".join(word["w"] for word in line_words[12][4:6]).capitalize() + "!"
    dictionary["secondSuccess"] = chr(161) + " ".join(word["w"] for word in line_words[28][8:10]).capitalize() + "!"
    dictionary["learningTitle"] = " ".join(word["w"] for word in line_words[29][:3])
    save(ROOT / "src/copy.json", dictionary)
    save(ROOT / "src/edit.json", {"fps": FPS, "width": 1280, "height": 720, "durationInFrames": cursor,
                                  "finalSubmission": True, "endingPending": True, "sections": sections, "media": media,
                                  "words": words, "voiceEvents": voice_events})
    save(ROOT / "src/captions.json", [{"text": word["text"], "startMs": round(word["start"] * 1000),
         "endMs": round(word["end"] * 1000), "timestampMs": None, "confidence": None} for word in words])
    save(ROOT / "reports/edit-summary.json", {"duration": duration, "scenes": len(sections),
         "sourceVideos": len(media), "photos": 10, "narration": "Existing Spanish performance: introduction shortened to the name; both success comments aligned to the launches; first comment continues into its replay.",
         "finalSubmission": True, "visualDirection": "Bright blue, orange and warm paper; bold readable titles; full-height portrait footage; no tiny category labels or decorative counters",
         "ending": "Open handoff after the second replay; no conclusion or end card.",
         "audioPeakBeforeMaster": float(np.max(np.abs(mix))), "voiceEvents": voice_events})

    cues, group = [], []
    for word in words:
        if group and (word["start"] - group[-1]["end"] > 0.35 or
                      len(" ".join(w["text"] for w in group + [word])) > 58):
            cues.append(group)
            group = []
        group.append(word)
    if group:
        cues.append(group)
    blocks = [f"{i + 1}\n{timestamp(cue[0]['start'])} --> {timestamp(cue[-1]['end'] + 0.06)}\n" +
              " ".join(w["text"] for w in cue) for i, cue in enumerate(cues)]
    (ROOT / "out/captions.srt").write_text("\n\n".join(blocks) + "\n", encoding="utf-8")
    print(f"Prepared {len(sections)} scenes; {duration:.3f}s; open handoff at frame {cursor}.", flush=True)


if __name__ == "__main__":
    main()
