from .CouvertureProgressionChart import CouvertureProgressionChart


class UsageProgressionChart(CouvertureProgressionChart):
    _level = 1
    _sol = "usage"
    _sub_title = "l'usage"


class UsageProgressionChartExport(UsageProgressionChart):
    pass
