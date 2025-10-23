from highcharts import charts
from project.models import Project
from public_data.models import LandModel

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
        start_date=None,
        end_date=None,
    ):
        self.project = project
        self.group_name = group_name
        self.start_date = start_date
        self.end_date = end_date
        super().__init__()


class DiagnosticChart(charts.Chart):
    print_width = 1000
    required_params = []  # Override in subclasses to specify required params

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
        land: LandModel,
        params: dict,
    ):
        # Validate required params
        if self.required_params:
            missing_params = [param for param in self.required_params if param not in params]
            if missing_params:
                raise ValueError(
                    f"{self.__class__.__name__}: Missing required parameters: {', '.join(missing_params)}"
                )

        self.params = params
        self.land = land
        super().__init__(add_series=False)
