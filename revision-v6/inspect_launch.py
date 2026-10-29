"""Inspect short source intervals at dense timestamps without changing the recording."""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np

parser = argparse.ArgumentParser()
parser.add_argument('--source', required=True)
parser.add_argument('--range', action='append', required=True)
parser.add_argument('--step', type=float, default=0.15)
parser.add_argument('--label', default='launch-search')
args = parser.parse_args()
root = Path(__file__).resolve().parent
output = root / 'out/review'
output.mkdir(parents=True, exist_ok=True)
capture = cv2.VideoCapture(args.source)
assert capture.isOpened()
times = []
for interval in args.range:
    start, end = map(float, interval.split(':'))
    times.extend(np.arange(start, end, args.step).tolist())
records = []
for page in range((len(times) + 23) // 24):
    canvas = np.full((4 * 430, 6 * 232, 3), 245, dtype=np.uint8)
    for index, time in enumerate(times[page * 24:(page + 1) * 24]):
        capture.set(cv2.CAP_PROP_POS_MSEC, time * 1000)
        ok, frame = capture.read()
        actual = capture.get(cv2.CAP_PROP_POS_MSEC) / 1000
        if not ok:
            records.append({'requested': time, 'read': False})
            continue
        height, width = frame.shape[:2]
        scale = min(228 / width, 397 / height)
        thumb = cv2.resize(frame, (round(width * scale), round(height * scale)))
        x, y = (index % 6) * 232, (index // 6) * 430
        canvas[y + 29:y + 29 + thumb.shape[0], x + 2:x + 2 + thumb.shape[1]] = thumb
        cv2.putText(canvas, f'{int(actual // 60):02d}:{actual % 60:06.3f}', (x + 5, y + 22), cv2.FONT_HERSHEY_SIMPLEX, .6, (25, 25, 25), 1, cv2.LINE_AA)
        records.append({'requested': time, 'actual': actual, 'read': True})
    target = output / f'{args.label}-{page + 1:02d}.jpg'
    assert not target.exists(), target
    cv2.imwrite(str(target), canvas, [cv2.IMWRITE_JPEG_QUALITY, 94])
    print(target.name, flush=True)
capture.release()
(root / 'reports').mkdir(exist_ok=True)
(root / 'reports' / f'{args.label}.json').write_text(json.dumps({'source': args.source, 'step': args.step, 'frames': records}, indent=2), encoding='utf-8')
