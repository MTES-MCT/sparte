"""Function used in multiple places in the module project"""


def add_total_line_column(series):
    table = dict()
    total_line = dict()
    for name, data in series.items():
        table[name] = data.copy()
        # add column
        table[name]["total"] = sum(data.values())
        # add cell for total line
        for year, val in data.items():
            total_line[year] = total_line.get(year, 0) + val
    # add column total in line total
    total_line["total"] = sum(total_line.values())
    table["Total"] = total_line
    return table
