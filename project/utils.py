"""Function used in multiple places in the module project"""
from collections import defaultdict


def add_total_line_column(series, column=True, line=True, replace_none=False):
    table = dict()
    total_line = defaultdict(lambda: 0)
    for name, data in series.items():
        if replace_none:
            table[name] = {y: v or 0 for y, v in data.items()}
        else:
            table[name] = data.copy()
        if column:
            # add column
            table[name]["total"] = sum([i for i in data.values() if i])
        if line:
            # add cell for total line
            for year, val in data.items():
                total_line[year] += val or 0
    if column:
        # add column total in line total
        total_line["total"] = sum(total_line.values())
    if line:
        table["Total"] = dict(total_line)
    return table
