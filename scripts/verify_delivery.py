"""Check exact picture alignment and embedded captions in the packaged documentary."""
import json
import re
import subprocess
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
FINAL = ROOT / 'Rocket-Documentary-v6-FINAL.mp4'
captures = {name: cv2.VideoCapture(str(file)) for name, file in {
    'final': FINAL, 'body': ROOT / 'revision-v5/out/picture.mp4',
    'tail': ROOT / 'revision-v6/out/results-picture.mp4'
}.items()}


def frame(name, index):
    capture = captures[name]
    capture.set(cv2.CAP_PROP_POS_FRAMES, index)
    success, image = capture.read()
    assert success, (name, index)
    return image.astype(np.float32)


try:
    assert int(captures['final'].get(cv2.CAP_PROP_FRAME_COUNT)) == 9696
    comparisons = []
    for source, indices, offset in [('body', [0, 210, 2250, 5076, 7115], 0),
                                     ('tail', [0, 30, 220, 270, 720, 1170, 1680, 1980, 2400, 2579], 7116)]:
        for index in indices:
            actual, expected = frame('final', index + offset), frame(source, index)
            mse = float(np.mean((actual - expected) ** 2))
            assert mse < 100, f'Picture mismatch: {source} frame {index}, MSE {mse}'
            comparisons.append({'source': source, 'sourceFrame': index, 'finalFrame': index + offset, 'meanSquaredError': mse})
    result = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(FINAL), '-map', '0:s:0', '-f', 'srt', '-'],
                            check=True, capture_output=True, text=True, encoding='utf-8')
    def seconds(groups):
        hours, minutes, whole, milliseconds = map(int, groups)
        return hours * 3600 + minutes * 60 + whole + milliseconds / 1000
    timings = [tuple(seconds(match[i:i+4]) for i in (0, 4)) for match in
               re.findall(r'(\d+):(\d+):(\d+),(\d+) --> (\d+):(\d+):(\d+),(\d+)', result.stdout)]
    assert timings and all(end > start for start, end in timings)
    assert all(previous[1] <= following[0] for previous, following in zip(timings, timings[1:]))
    assert timings[-1][1] <= 323.2
    report = {'frames': 9696, 'duration': 323.2, 'joinFrame': 7116, 'joinSeconds': 237.2,
              'releaseSeconds': 244.512, 'pictureComparisons': comparisons,
              'embeddedCaptionCues': len(timings), 'embeddedCaptionsDoNotOverlap': True,
              'result': 'All sampled frames align with their source timeline; no half-second transition shift.'}
    (ROOT / 'revision-v6/reports/exact-alignment.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))
finally:
    for capture in captures.values():
        capture.release()
