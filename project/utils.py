"""Function used in multiple places in the module project"""


def add_total_line_column(series, column=True, line=True):
    table = dict()
    total_line = dict()
    for name, data in series.items():
        table[name] = data.copy()
        if column:
            # add column
            table[name]["total"] = sum(data.values())
        if line:
            # add cell for total line
            for year, val in data.items():
                total_line[year] = total_line.get(year, 0) + val
    if column:
        # add column total in line total
        total_line["total"] = sum(total_line.values())
    if line:
        table["Total"] = total_line
    return table
