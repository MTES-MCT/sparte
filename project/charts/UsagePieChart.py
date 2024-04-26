from .CouverturePieChart import CouverturePieChart, CouverturePieChartExport


class UsagePieChart(CouverturePieChart):
    _level = 1
    _sol = "usage"


class UsagePieChartExport(CouverturePieChartExport):
    pass
