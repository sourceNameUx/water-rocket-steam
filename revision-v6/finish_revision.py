"""Join the preserved picture with the revised ending and validate the packaged MP4."""
import json
from pathlib import Path

from prepare import helper, save

ROOT = Path(__file__).resolve().parent
DELIVERY = ROOT.parent / 'Rocket-Documentary-v6-FINAL.mp4'
with_audio = ROOT / 'out/revision-master-exact.mp4'
plan = {
    'output': str(with_audio),
    'clips': [
        {'src': str(ROOT.parent / 'revision-v5/out/picture.mp4'), 'in': 0, 'out': 237.2},
        {'src': str(ROOT / 'out/results-picture.mp4')}
    ],
    'transition': {'type': 'none'},
    'audio': {'replace': str(ROOT / 'out/revision-mix.wav')},
    'loudness': {'lufs': -16, 'tp': -1.5}
}
plan_path = ROOT / 'plans/final-delivery-v6.json'
save(plan_path, plan)
if not with_audio.exists():
    helper('render.py', [plan_path, '--dry-run', '--json'], 'final-delivery-plan.json')
    helper('render.py', [plan_path, '--json'], 'final-delivery-master.json')
if not DELIVERY.exists():
    args = [with_audio, '--srt', str(ROOT / 'out/revision-captions.srt') + ':mul', '--mode', 'mux', '-o', DELIVERY]
    helper('caption.py', args + ['--dry-run', '--json'], 'final-caption-plan.json')
    helper('caption.py', args + ['--json'], 'final-captions.json')
check = json.loads(helper('check.py', [DELIVERY, '--platform', 'custom', '--aspect', '16:9', '--lufs', -16, '--tp', -1, '--content', '--json'], 'final-check.json'))
assert check['ok'] and check['failed'] == 0
probe = json.loads(helper('probe.py', [DELIVERY, '--json'], 'final-probe.json'))
assert (probe['video']['width'], probe['video']['height']) == (1280, 720)
assert probe['video']['fps'] == 30
assert int(probe['video']['nb_frames']) == 9696
assert abs(probe['duration'] - 323.2) < .06
assert probe['audio']['channels'] == 2 and probe['subtitle_streams'] == 1
save(ROOT / 'reports/delivery-v6.json', {'file': str(DELIVERY), 'duration': probe['duration'], 'frames': 9696,
    'sizeBytes': DELIVERY.stat().st_size, 'sourceIn': 375.5, 'sourceOut': 391.5, 'launchAt': 244.512,
    'pictureBoundary': 237.2, 'narration': 'Existing Spanish body, revised English ending per latest session protocol',
    'technicalCheck': check, 'audioReview': 'Source alignment, non-overlap and loudness measured; no subjective-listening claim'})
print(f'Completed and verified: {DELIVERY}', flush=True)
