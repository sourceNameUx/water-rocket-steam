"""Verify exact picture joins, actual Spanish speech and embedded caption content."""
import json
import re
import subprocess
from pathlib import Path

import av
import cv2
import numpy as np
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent
FINAL = ROOT.parent / 'Rocket-Documentary-v8-SPANISH.mp4'


def main():
    captures = {name: cv2.VideoCapture(str(file)) for name, file in {
        'final': FINAL, 'body': ROOT.parent / 'revision-v5/out/picture.mp4',
        'tail': ROOT / 'out/ending-picture.mp4'}.items()}
    comparisons = []

    def frame(name, index):
        capture = captures[name]
        capture.set(cv2.CAP_PROP_POS_FRAMES, index)
        success, image = capture.read()
        assert success, (name, index)
        return image.astype(np.float32)

    try:
        assert int(captures['final'].get(cv2.CAP_PROP_FRAME_COUNT)) == 9696
        for source, indices, offset in [('body', [0, 210, 2250, 5076, 7115], 0),
                                       ('tail', [0, 30, 220, 270, 720, 1200, 1740, 1980, 2370, 2579], 7116)]:
            for index in indices:
                mse = float(np.mean((frame('final', index + offset) - frame(source, index)) ** 2))
                assert mse < 100, f'Picture mismatch: {source} frame {index}, MSE {mse}'
                comparisons.append({'source': source, 'sourceFrame': index, 'finalFrame': index + offset, 'meanSquaredError': mse})
    finally:
        for capture in captures.values():
            capture.release()

    cues = []
    with av.open(str(FINAL)) as container:
        stream = container.streams.subtitles[0]
        assert stream.metadata['language'] == 'spa'
        for packet in container.demux(stream):
            payload = bytes(packet)
            if len(payload) < 2 or packet.pts is None:
                continue
            size = int.from_bytes(payload[:2], 'big')
            if not size:
                continue
            start = float(packet.pts * packet.time_base)
            end = start + float(packet.duration * packet.time_base)
            cues.append({'start': start, 'end': end, 'text': payload[2:2 + size].decode('utf-8')})
    assert cues and all(cue['end'] > cue['start'] for cue in cues)
    assert all(a['end'] <= b['start'] + .001 for a, b in zip(cues, cues[1:]))
    srt = (ROOT / 'out/spanish-captions.srt').read_text(encoding='utf-8')
    blocks = [block.splitlines() for block in srt.strip().split('\n\n')]
    expected = ['\n'.join(block[2:]) for block in blocks]
    # The caption muxer adds readable line breaks without changing the words.
    assert [' '.join(cue['text'].split()) for cue in cues] == [' '.join(text.split()) for text in expected], 'Embedded text differs from the Spanish caption source'
    def seconds(value):
        hours, minutes, rest = value.split(':')
        return int(hours) * 3600 + int(minutes) * 60 + float(rest.replace(',', '.'))
    for cue, block in zip(cues, blocks):
        start, end = map(seconds, block[1].split(' --> '))
        assert abs(cue['start'] - start) < .002 and abs(cue['end'] - end) < .002, 'Embedded caption timing differs from the source'
    assert not re.search(r'\b(the|reached|baking|goal|finished|would)\b', ' '.join(expected), re.I)

    model = WhisperModel('tiny', device='cpu', compute_type='int8', cpu_threads=2, num_workers=1, local_files_only=True)
    # Read packaged audio through FFmpeg; the installed PyAV API differs from Whisper's decoder.
    decoded = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(FINAL), '-map', '0:a:0',
                              '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', 'pipe:1'],
                             capture_output=True, check=True)
    audio = np.frombuffer(decoded.stdout, dtype=np.float32)
    speech = []
    ranges = [('opening', 0, 25), ('science', 25, 43), ('construction', 95, 113), ('design', 169.2, 185.2),
              ('theoretical-example', 219.2, 237.2), ('final-launch', 237.2, 253.2), ('comparison', 253.2, 269.2),
              ('quantities', 269.2, 285.2), ('analysis', 285.2, 299.2), ('mass', 299.2, 309.2), ('conclusion', 309.2, 323.2)]
    for name, start, end in ranges:
        segments, info = model.transcribe(audio[round(start * 16000):round(end * 16000)], beam_size=1, vad_filter=True)
        text = ' '.join(segment.text.strip() for segment in segments)
        record = {'section': name, 'start': start, 'end': end, 'detectedLanguage': info.language,
                  'languageProbability': info.language_probability, 'transcript': text}
        speech.append(record)
        print(json.dumps(record, ensure_ascii=True), flush=True)
        assert info.language == 'es' and text, f'Non-Spanish or missing speech: {name}'
    report = {'file': str(FINAL), 'frames': 9696, 'duration': 323.2, 'joinSeconds': 237.2,
              'releaseSeconds': 244.512, 'pictureComparisons': comparisons, 'captionCues': len(cues),
              'embeddedCaptionsMatchSpanishSource': True, 'captionComparison': 'Exact words and timing; line wrapping ignored', 'speechChecks': speech,
              'allSampledSpeechSpanish': True, 'reviewMethod': 'Automatic recognition of actual packaged audio; no subjective-listening claim'}
    (ROOT / 'reports/media-verification.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print('Verified exact joins, embedded Spanish captions and Spanish speech in all eleven sampled sections.')


if __name__ == '__main__':
    main()
