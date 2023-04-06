from typing import Any, List

from openpyxl import Workbook
from openpyxl.styles import Font


class LineSizeException(Exception):
    pass


def write_sheet(wb: Workbook, headers: List[str], data: List[Any], sheet_name: str = None) -> None:
    if not sheet_name:
        sheet_name = "Sans nom"
    sheet = wb.create_sheet(sheet_name)
    line_size = len(headers)
    sheet.append(headers)
    for r in sheet[1]:
        r.font = Font(bold=True)
    for i, row in enumerate(data):
        if len(row) != line_size:
            raise LineSizeException(f"Line {i - 1} isn't of the good size.")
        sheet.append(row)
    return sheet
