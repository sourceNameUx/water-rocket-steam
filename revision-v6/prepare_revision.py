"""Build source-aligned media and one non-overlapping soundtrack for revision six."""
import json
import subprocess
from pathlib import Path

import numpy as np

from prepare import RATE, helper, pcm, save, timestamp, wav

ROOT = Path(__file__).resolve().parent
BASELINE = ROOT.parent / 'revision-v5'
PLAN = json.loads((ROOT / 'narration/revision-plan.json').read_text())
TTS_ROOT = Path.home() / '.config/opencode/skills/editar-reels'


def main():
    media = ROOT / 'public/media/final-launch-v6.mp4'
    media_plan = ROOT / 'plans/final-launch-v6.json'
    save(media_plan, {'output': str(media), 'clips': [{'src': PLAN['source'], 'in': PLAN['sourceIn'], 'out': PLAN['sourceOut']}],
                     'frame': {'width': 540, 'height': 960, 'fps': 30, 'fit': 'pad'}})
    if not media.exists():
        helper('render.py', [media_plan, '--dry-run', '--json'], 'launch-media-plan.json')
        helper('render.py', [media_plan, '--json'], 'launch-media.json')
    total = round((PLAN['appendAt'] + PLAN['duration']) * RATE)
    boundary = round(PLAN['appendAt'] * RATE)
    voice = np.zeros(total, dtype=np.float32)
    voice[:boundary] = pcm(BASELINE / 'public/audio/results-voice.wav')[:boundary, 0]
    edit = json.loads((BASELINE / 'src/edit.json').read_text(encoding='utf-8'))
    events = [event for event in edit['voiceEvents'] if event['start'] < PLAN['appendAt']]
    words = [word for word in edit['words'] if word['start'] < PLAN['appendAt']]
    for shot in PLAN['shots']:
        output = ROOT / 'narration' / f"v6-{shot['id']}.wav"
        if not output.exists():
            result = subprocess.run([str(TTS_ROOT / '.venv/Scripts/python.exe'), str(TTS_ROOT / 'scripts/tts.py'),
                '--text', shot['speech'], '--preset', 'narrador', '--voice', PLAN['voice'], '--rate', str(PLAN['rate']),
                '--no-normalize', '--out', str(output), '--words', str(output.with_suffix('.json'))],
                capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=240)
            if result.returncode:
                raise RuntimeError(result.stderr)
        source_words = json.loads(output.with_suffix('.json').read_text())['words']
        raw = pcm(output)[:, 0]
        first = max(0, source_words[0]['start'] - .05)
        last = min(len(raw) / RATE, source_words[-1]['end'] + .12)
        clip = raw[round(first * RATE):round(last * RATE)].copy()
        at = PLAN['appendAt'] + shot['at']
        assert at + len(clip) / RATE < PLAN['appendAt'] + shot['endBefore'], shot['id']
        clip[:240] *= np.linspace(0, 1, 240)
        clip[-240:] *= np.linspace(1, 0, 240)
        begin = round(at * RATE)
        assert not np.any(voice[begin:begin + len(clip)])
        voice[begin:begin + len(clip)] = clip
        events.append({'id': shot['id'], 'start': at, 'end': at + len(clip) / RATE,
                       'source': output.name, 'sourceStart': first, 'sourceEnd': last})
        words.extend({'text': word['w'], 'start': at + word['start'] - first, 'end': at + word['end'] - first} for word in source_words)
        print(f"Prepared {shot['id']}: {at:.3f}-{at + len(clip) / RATE:.3f}s", flush=True)
    events.sort(key=lambda item: item['start'])
    words.sort(key=lambda item: item['start'])
    assert all(a['end'] <= b['start'] for a, b in zip(events, events[1:]))

    location = np.zeros((total, 2), dtype=np.float32)
    location[:boundary] = pcm(BASELINE / 'public/audio/results-location.wav')[:boundary]
    source_audio = pcm(ROOT / 'out/correct-source-audio.wav')
    source_begin = round((PLAN['sourceIn'] - PLAN['sourceAudioOffset']) * RATE)
    field = source_audio[source_begin:source_begin + 16 * RATE].copy()
    field *= .45
    field[:2400] *= np.linspace(0, 1, 2400)[:, None]
    field[-4800:] *= np.linspace(1, 0, 4800)[:, None]
    for event in events:
        if event['start'] < PLAN['appendAt']:
            continue
        left = max(0, round((event['start'] - PLAN['appendAt'] - .12) * RATE))
        right = min(len(field), round((event['end'] - PLAN['appendAt'] + .15) * RATE))
        if right > left:
            envelope = np.full(right - left, .12, dtype=np.float32)
            fade = min(4800, len(envelope) // 2)
            envelope[:fade] = np.linspace(1, .12, fade)
            envelope[-fade:] = np.linspace(.12, 1, fade)
            field[left:right] *= envelope[:, None]
    location[boundary:boundary + len(field)] = field

    music = np.zeros((total, 2), dtype=np.float32)
    music[:boundary] = pcm(BASELINE / 'public/audio/results-music.wav')[:boundary]
    bed = pcm(ROOT.parent / 'revision-v4/public/audio/music.wav')[30 * RATE:116 * RATE].copy()
    levels = np.ones(8600, dtype=np.float32) * .55
    for event in events:
        if event['start'] >= PLAN['appendAt']:
            left = max(0, round((event['start'] - PLAN['appendAt'] - .15) * 100))
            right = min(len(levels), round((event['end'] - PLAN['appendAt'] + .25) * 100))
            levels[left:right] = .22
    levels[:1600] = .04
    levels = np.convolve(np.pad(levels, (20, 20), mode='edge'), np.ones(41) / 41, mode='valid')
    bed *= np.repeat(levels, 480)[:, None]
    bed[:RATE] *= np.linspace(0, 1, RATE)[:, None]
    bed[-3 * RATE:] *= np.linspace(1, 0, 3 * RATE)[:, None]
    music[boundary:] = bed
    effects = np.zeros((total, 2), dtype=np.float32)
    accents = pcm(BASELINE / 'public/audio/effects.wav')
    effects[:min(total, len(accents))] = accents[:total]
    mix = voice[:, None] + location + music + effects
    assert np.max(np.abs(mix)) < .97
    for name, audio in [('voice', voice), ('location', location), ('music', music)]:
        wav(ROOT / f'public/audio/v6-{name}.wav', audio)
    wav(ROOT / 'out/revision-mix.wav', mix)

    cues, group = [], []
    for word in words:
        if group and (word['start'] - group[-1]['end'] > .32 or len(' '.join(x['text'] for x in group + [word])) > 56):
            cues.append(group)
            group = []
        group.append(word)
    if group:
        cues.append(group)
    blocks = []
    for index, cue in enumerate(cues):
        next_start = cues[index + 1][0]['start'] if index + 1 < len(cues) else total / RATE
        end = min(cue[-1]['end'] + .04, next_start - .005)
        blocks.append(f"{index + 1}\n{timestamp(cue[0]['start'])} --> {timestamp(end)}\n" + ' '.join(word['text'] for word in cue))
    (ROOT / 'out/revision-captions.srt').write_text('\n\n'.join(blocks) + '\n', encoding='utf-8')
    edit.update(words=words, voiceEvents=events, finalFootageEvidence=PLAN['evidence'])
    save(ROOT / 'src/edit.json', edit)
    save(ROOT / 'reports/revision-audio.json', {'duration': total / RATE, 'peakBeforeMaster': float(np.max(np.abs(mix))),
        'voiceEventsDoNotOverlap': True, 'finalRelease': PLAN['appendAt'] + PLAN['releaseBracket'][1] - PLAN['sourceIn'],
        'commentaryAt': PLAN['appendAt'] + 7.8, 'sourceAudioOffsetApplied': PLAN['sourceAudioOffset'],
        'sourceSound': 'Single source-aligned track, reduced under speech. Embedded video is muted.', 'events': events})


if __name__ == '__main__':
    main()
