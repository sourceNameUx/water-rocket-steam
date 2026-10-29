"""Prepare a complete, traceable set of original project photographs for the report."""
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
OUTPUT = ROOT / 'evidence'
REVIEW = ROOT / 'review'
OUTPUT.mkdir(parents=True, exist_ok=True)
REVIEW.mkdir(parents=True, exist_ok=True)
sources = sorted((PROJECT / 'RECURSOS-VIDEO/fotos').glob('*.jpg'))
assert len(sources) == 15, len(sources)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 20)
records = []
for index, source in enumerate(sources, 1):
    name = f'photo-{index:02d}.jpg'
    with Image.open(source) as original:
        photo = ImageOps.exif_transpose(original).convert('RGB')
        photo.thumbnail((1800, 1800))
        photo.save(OUTPUT / name, quality=92)
        records.append({'id': index, 'file': name, 'source': source.relative_to(PROJECT).as_posix(),
                        'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                        'width': photo.width, 'height': photo.height,
                        'processing': 'EXIF orientation applied; resized proportionally; no crop or retouching.'})
for start in (0, 8):
    batch = records[start:start + 8]
    sheet = Image.new('RGB', (1400, 760), 'white')
    draw = ImageDraw.Draw(sheet)
    for position, record in enumerate(batch):
        photo = Image.open(OUTPUT / record['file'])
        photo.thumbnail((330, 330))
        x, y = position % 4 * 350, position // 4 * 380
        sheet.paste(photo, (x + (350 - photo.width) // 2, y + (340 - photo.height) // 2))
        draw.text((x + 12, y + 345), f"Photo {record['id']:02d}", font=font, fill='black')
    sheet.save(REVIEW / f'contact-{start // 8 + 1}.jpg', quality=92)
(ROOT / 'evidence-manifest.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(records, ensure_ascii=True, indent=2))
