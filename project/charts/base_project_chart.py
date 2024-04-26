from highcharts import charts
from project.models import Project


class ProjectChart(charts.Chart):
    def __init__(self, project: Project, group_name=None):
        self.project = project
        self.group_name = group_name
        super().__init__()
