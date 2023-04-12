from project.charts import ObjectiveChart
from project.models import Project


class NoTrajectoryException(Exception):
    pass


class TrajectoryChart(ObjectiveChart):
    """Chart qui affiche une trajectoire"""

    def __init__(self, project: Project):
        self.trajectory = project.trajectory_set.all().first()
        if not self.trajectory:
            raise NoTrajectoryException(f"Project id={self.project.id} has no trajectory")
        super().__init__(project)
        self.chart["chart"]["zoomType"] = "x"
        self.chart["xAxis"]["categories"] = [str(i) for i in range(self.trajectory.start, self.trajectory.end + 1)]

    def get_starting_cumulative_value(self) -> float:
        # get objectives 2031 cumulative
        data = {_["name"]: _["y"] for _ in self.chart["series"][3]["data"]}
        # append or replace with cumulative real
        data |= {_["name"]: _["y"] for _ in self.chart["series"][1]["data"]}
        try:
            return data[str(self.trajectory.start - 1)]
        except KeyError:
            return 0

    def add_series(self) -> None:  # type: ignore
        super().add_series()
        self.chart["series"].append(
            {
                "name": "Trajectoire",
                "yAxis": 1,
                "type": "line",
                "color": "#eaa568",
                "zIndex": 5,
                "data": [{"name": str(y), "y": v} for y, v in self.trajectory.get_value_per_year().items()],
            }
        )
        cumulative_trajectory = {
            "name": "Trajectoire cumulée",
            "color": "#eaa568",
            "zIndex": 1,
            "data": [],
        }
        total = self.get_starting_cumulative_value()
        for point in self.chart["series"][-1]["data"]:
            total += point["y"]
            cumulative_trajectory["data"].append({"name": point["name"], "y": total})  # type: ignore
        self.chart["series"].append(cumulative_trajectory)
        self.reduce_series_to_trajectory()

    def reduce_series_to_trajectory(self) -> None:
        for serie in self.chart["series"]:
            for i in range(len(serie["data"]) - 1, -1, -1):
                if not (self.trajectory.start <= int(serie["data"][i]["name"]) <= self.trajectory.end):
                    del serie["data"][i]
