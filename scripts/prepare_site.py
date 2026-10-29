"""Prepare optimized, locally hosted project assets without altering source files."""
import argparse
import json
import shutil
import subprocess
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'docs/assets'
ASSETS.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--documentary-only', action='store_true', help='Update the film, poster and captions only')
args = parser.parse_args()
sources = {
    'finished-rocket.webp': 'revision-v6/public/design/final-001.jpg',
    'prototype.webp': 'revision-v6/public/media/p01.jpg',
    'fins.webp': 'revision-v6/public/design/fins-detail.jpg',
    'nose.webp': 'revision-v6/public/design/nose-detail.jpg',
    'documentary-poster.webp': 'revision-v8/out/review/frame-60.png',
}
manifest = []
if args.documentary_only:
    sources = {'documentary-poster.webp': sources['documentary-poster.webp']}
    manifest = [entry for entry in json.loads((ASSETS / 'provenance.json').read_text(encoding='utf-8'))
                if entry['file'] != 'documentary-poster.webp']
for name, source in sources.items():
    image = Image.open(ROOT / source).convert('RGB')
    image.thumbnail((1280, 1480))
    origin = f'User-supplied project material; source: {source}. Resized and encoded as WebP; no generated imagery.'
    xmp = f'<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/" dc:source="{origin}"/></rdf:RDF></x:xmpmeta>'
    image.save(ASSETS / name, quality=87, method=6, xmp=xmp.encode())
    subprocess.run(['cmd', '/c', str(Path.home() / '.config/opencode/skills/impeccable/scripts/impeccable.cmd'),
                    'embed-prompt', str(ASSETS / name), '--prompt', origin], check=True)
    manifest.append({'file': name, 'origin': origin, 'width': image.width, 'height': image.height})
fonts = {
    'atkinson-regular.ttf': 'https://fonts.gstatic.com/s/atkinsonhyperlegible/v12/9Bt23C1KxNDXMspQ1lPyU89-1h6ONRlW45GE5Q.ttf',
    'atkinson-bold.ttf': 'https://fonts.gstatic.com/s/atkinsonhyperlegible/v12/9Bt73C1KxNDXMspQ1lPyU89-1h6ONRlW45G8WbcNcw.ttf',
    'barlow-condensed-bold.ttf': 'https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B46r2_3E.ttf',
    'atkinson-OFL.txt': 'https://raw.githubusercontent.com/google/fonts/main/ofl/atkinsonhyperlegible/OFL.txt',
    'barlow-OFL.txt': 'https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/OFL.txt',
}
for name, url in ([] if args.documentary_only else fonts.items()):
    destination = ASSETS / name
    if not destination.exists():
        urllib.request.urlretrieve(url, destination)
for extension in (() if args.documentary_only else ('docx', 'pdf')):
    destination = ASSETS / f'rocket-report.{extension}'
    destination.unlink(missing_ok=True)
    shutil.copy2(ROOT / f'Rocket-Complete-Report-v7.{extension}', destination)
delivery = ROOT / 'Rocket-Documentary-v8-SPANISH.mp4'
assert delivery.exists(), 'The verified Spanish documentary must be assembled first'
shutil.copy2(delivery, ASSETS / 'rocket-documentary.mp4')
(ASSETS / 'provenance.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
captions = (ROOT / 'revision-v8/out/spanish-captions.srt').read_text(encoding='utf-8')
import re
captions = re.sub(r'(\d\d:\d\d:\d\d),(\d{3})', r'\1.\2', captions)
(ASSETS / 'documentary.vtt').write_text('WEBVTT\n\n' + captions, encoding='utf-8')
print('Prepared documentary assets.' if args.documentary_only else 'Prepared website photographs, fonts, reports and timed captions.')
