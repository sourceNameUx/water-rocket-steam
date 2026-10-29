"""Validate the exported submission, photograph identity, pagination and text."""
import hashlib
import json
import re
import zipfile
from pathlib import Path

import pymupdf as fitz
from docx import Document
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
TARGET = ROOT.parent / 'Rocket-Complete-Report-v7'
REVIEW = ROOT / 'review'
REVIEW.mkdir(exist_ok=True)
copy = json.loads((ROOT / 'report-copy.json').read_text(encoding='utf-8'))
order = json.loads((ROOT / 'reports/photo-order.json').read_text())
pdf = fitz.open(TARGET.with_suffix('.pdf'))
docx = Document(TARGET.with_suffix('.docx'))
assert len(pdf) == 8, f'Unexpected pagination: {len(pdf)}'
assert len(docx.inline_shapes) == 15
assert docx.core_properties.language == 'es-CO'
assert len(docx.tables) == 7
assert sorted(order) == list(range(1, 16))


def normalize(value):
    return re.sub(r'\s+', '', value).replace('\u00ad', '')


page_text = [page.get_text() for page in pdf]
expected_cover = [copy[key] for key in ('title', 'subtitle', 'school', 'place', 'author', 'grade', 'year', 'subject')]
for value in expected_cover:
    assert normalize(value) in normalize(page_text[0]), value
photo_number = 0
for page_index, blocks in enumerate(copy['pages'], 1):
    expected = []
    for kind, value in blocks:
        if kind == 'photos':
            for photo_id in value:
                photo_number += 1
                expected.append(f'Foto {photo_number}. {copy["captions"][str(photo_id)]}')
        elif kind in copy['tables']:
            expected.extend(cell for row in copy['tables'][kind] for cell in row)
        else:
            expected.append(value)
    for value in expected:
        assert normalize(value) in normalize(page_text[page_index]), f'Page {page_index + 1} missing: {value}'

with zipfile.ZipFile(TARGET.with_suffix('.docx')) as package:
    media = [name for name in package.namelist() if name.startswith('word/media/')]
    assert len(media) == 15, media
    assert not any(name.startswith('word/embeddings/') for name in package.namelist())
    embedded_hashes = sorted(hashlib.sha256(package.read(name)).hexdigest() for name in media)
    source_hashes = sorted(hashlib.sha256(path.read_bytes()).hexdigest() for path in (ROOT / 'evidence').glob('*.jpg'))
    assert embedded_hashes == source_hashes, 'Embedded images differ from prepared original photographs'

image_counts = []
for index, page in enumerate(pdf):
    image_info = page.get_image_info()
    image_counts.append(len(image_info))
    for image in image_info:
        bounds = fitz.Rect(image['bbox'])
        assert page.rect.contains(bounds)
        assert abs(bounds.width / bounds.height - image['width'] / image['height']) < .005
    for block in page.get_text('dict')['blocks']:
        if block['type'] != 0:
            continue
        for line in block['lines']:
            bounds = fitz.Rect(line['bbox'])
            assert bounds.x0 >= 50 and bounds.x1 <= 562, (index + 1, 'horizontal text overflow', bounds)
            assert bounds.y0 >= 40 and bounds.y1 <= 775, (index + 1, 'vertical text overflow', bounds)
    page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(REVIEW / f'report-page-{index + 1}.png')
assert image_counts == [0, 0, 3, 4, 4, 4, 0, 0], image_counts
for start in (0, 4):
    sheet = Image.new('RGB', (1280, 1720), '#ddd')
    for offset in range(4):
        image = Image.open(REVIEW / f'report-page-{start + offset + 1}.png')
        image.thumbnail((610, 820))
        x, y = (offset % 2) * 640 + 15, (offset // 2) * 860 + 15
        sheet.paste(image, (x, y))
        ImageDraw.Draw(sheet).text((x, y + 824), f'Page {start + offset + 1}', fill='black')
    sheet.save(REVIEW / f'layout-{start // 4 + 1}.jpg', quality=94)
report = {
    'pages': len(pdf), 'language': 'Spanish', 'photographs': 15,
    'photoCountsByPage': image_counts, 'allTextOnExpectedPages': True,
    'allPreparedPhotographsEmbeddedExactly': True, 'noEmbeddedVideo': True,
    'noTextOverflow': True, 'photoAspectRatiosPreserved': True,
    'pdfExporter': 'Microsoft Word', 'coverVerified': expected_cover,
    'wordCount': len(' '.join(page_text).split()),
    'files': {suffix: {'name': TARGET.with_suffix(suffix).name,
                      'bytes': TARGET.with_suffix(suffix).stat().st_size,
                      'sha256': hashlib.sha256(TARGET.with_suffix(suffix).read_bytes()).hexdigest()}
              for suffix in ('.docx', '.pdf')}
}
(ROOT / 'reports/document-build.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=True, indent=2))
