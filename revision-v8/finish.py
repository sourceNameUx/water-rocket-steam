"""Assemble and verify the all-Spanish documentary without overwriting prior masters."""
import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
PYTHON = Path.home() / '.local/share/opencode/video-tools/.venv/Scripts/python.exe'
TOOLS = Path.home() / '.config/opencode/skills/ffmpeg-skill/scripts'


def helper(name, arguments, log):
    process = subprocess.run([str(PYTHON), str(TOOLS / name), *map(str, arguments)],
        capture_output=True, text=True, encoding='utf-8', errors='replace')
    (ROOT / 'reports' / log).write_text(process.stdout + '\n' + process.stderr, encoding='utf-8')
    if process.returncode:
        raise RuntimeError(f'{name}: {process.stdout[-4000:]} {process.stderr[-2000:]}')
    return json.loads(process.stdout)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    (ROOT / 'reports').mkdir(exist_ok=True)
    master = ROOT / 'out/spanish-master.mp4'
    delivery = PROJECT / 'Rocket-Documentary-v8-SPANISH.mp4'
    plan = {'output': str(master), 'clips': [
        {'src': str(PROJECT / 'revision-v5/out/picture.mp4'), 'in': 0, 'out': 237.2},
        {'src': str(ROOT / 'out/ending-picture.mp4')}],
        'transition': {'type': 'none'}, 'audio': {'replace': str(ROOT / 'out/spanish-mix.wav')},
        'loudness': {'lufs': -16, 'tp': -1.5}}
    plan_path = ROOT / 'delivery.project.json'
    plan_path.write_text(json.dumps(plan, indent=2), encoding='utf-8')
    preview = {'status': 'Reusing existing master', 'output': str(master)}
    if not master.exists():
        preview = helper('render.py', [plan_path, '--dry-run', '--json'], 'delivery-plan.json')
    if args.dry_run:
        print(json.dumps(preview, indent=2))
        return
    if not master.exists():
        helper('render.py', [plan_path, '--json'], 'delivery-render.json')
    if not delivery.exists():
        args = [master, '--srt', str(ROOT / 'out/spanish-captions.srt') + ':spa', '--mode', 'mux', '--min-duration', '0', '-o', delivery]
        helper('caption.py', args + ['--dry-run', '--json'], 'caption-plan.json')
        helper('caption.py', args + ['--json'], 'caption-render.json')
    check = helper('check.py', [delivery, '--platform', 'custom', '--aspect', '16:9', '--lufs', -16, '--tp', -1, '--content', '--json'], 'final-check.json')
    assert check['ok'] and check['failed'] == 0
    probe = helper('probe.py', [delivery, '--json'], 'final-probe.json')
    assert (probe['video']['width'], probe['video']['height'], probe['video']['fps']) == (1280, 720, 30)
    assert int(probe['video']['nb_frames']) == 9696 and abs(probe['duration'] - 323.2) < .06
    assert probe['audio']['channels'] == 2 and probe['subtitle_streams'] == 1
    assert probe['subtitle_stream_details'][0]['language'] == 'spa'
    print(json.dumps({'output': str(delivery), 'duration': probe['duration'], 'frames': 9696, 'language': 'es', 'check': check}, indent=2))


if __name__ == '__main__':
    main()
