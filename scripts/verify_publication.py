"""Compare public Pages assets with the committed release, including the complete film."""
import argparse
import hashlib
import json
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base', default='https://sourceNameUx.github.io/water-rocket-steam/')
args = parser.parse_args()
base = args.base.rstrip('/') + '/'


def git(*arguments):
    return subprocess.check_output(['git', *arguments], cwd=ROOT)


revision = git('rev-parse', 'HEAD').decode().strip()
files = [name for name in git('ls-tree', '-r', '--name-only', revision, 'docs').decode().splitlines()
         if not Path(name).name.startswith('.')]
assert files, 'No committed website files found'


def verify(name):
    expected = git('show', f'{revision}:{name}')
    digest = hashlib.sha256()
    size = 0
    request = Request(base + quote(name.removeprefix('docs/')), headers={'User-Agent': 'Rocket-Release-Check'})
    with urlopen(request, timeout=120) as response:
        assert response.status == 200, (name, response.status)
        content_type = response.headers.get_content_type()
        while block := response.read(1024 * 1024):
            size += len(block)
            digest.update(block)
    expected_digest = hashlib.sha256(expected).hexdigest()
    assert digest.hexdigest() == expected_digest, f'Published content differs from {revision}: {name}'
    return {'path': name, 'bytes': size, 'sha256': expected_digest, 'contentType': content_type}


with ThreadPoolExecutor(max_workers=4) as executor:
    assets = list(executor.map(verify, files))

request = Request(base + 'assets/rocket-documentary.mp4', headers={'Range': 'bytes=0-31'})
with urlopen(request, timeout=60) as response:
    assert response.status == 206, 'Video server does not honor byte-range requests'
    content_range = response.headers.get('Content-Range', '')
    assert content_range.startswith('bytes 0-31/'), content_range
    assert len(response.read()) == 32

report = {
    'checkedAt': datetime.now(timezone.utc).isoformat(),
    'base': base,
    'comparedRevision': revision,
    'allPublishedAssetsMatch': True,
    'videoByteRangeSupported': True,
    'assets': assets,
}
output = ROOT / '.impeccable/review/published/asset-verification.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'verifiedAssets': len(assets), 'comparedRevision': revision,
                  'videoByteRangeSupported': True, 'report': str(output)}, indent=2))
