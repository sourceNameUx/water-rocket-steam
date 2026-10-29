"""Export through Microsoft Word so the PDF matches the editable DOCX layout."""
from pathlib import Path

import win32com.client

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'Rocket-Complete-Report-v7.docx'
word = win32com.client.DispatchEx('Word.Application')
word.Visible = False
word.DisplayAlerts = 0
document = None
try:
    document = word.Documents.Open(str(SOURCE), ReadOnly=True, AddToRecentFiles=False)
    document.Repaginate()
    document.Fields.Update()
    pages = document.ComputeStatistics(2)
    document.ExportAsFixedFormat(str(SOURCE.with_suffix('.pdf')), 17, OpenAfterExport=False)
    print(f'Exported {pages} pages through Microsoft Word.')
finally:
    if document is not None:
        document.Close(False)
    word.Quit()
