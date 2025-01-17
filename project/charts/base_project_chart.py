from highcharts import charts
from project.models import Project

from .constants import NO_DATA_STYLE


class ProjectChart(charts.Chart):
    @property
    def param(self):
        return {
            "noData": {
                "style": NO_DATA_STYLE,
            },
            "legend": {
                "itemWidth": 200,
                "itemStyle": {"textOverflow": None},
                "layout": "vertical",
                "align": "right",
                "verticalAlign": "middle",
            },
        }

    def __init__(
        self,
        project: Project,
        group_name=None,
        start_date=Project.analyse_start_date,
        end_date=Project.analyse_end_date,
    ):
        self.project = project
        self.group_name = group_name
        self.start_date = start_date
        self.end_date = end_date
        super().__init__()
