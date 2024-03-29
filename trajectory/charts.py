from project.charts import ObjectiveChart
from project.models import Project


class NoTrajectoryException(Exception):
    pass


class TrajectoryChart(ObjectiveChart):
    """Chart qui affiche une trajectoire"""

    def __init__(self, project: Project):
        self.trajectory = project.trajectory_set.all().first()
        if not self.trajectory:
            raise NoTrajectoryException(f"Project id={project.id} has no trajectory")
        super().__init__(project)
        self.chart["chart"]["zoomType"] = "x"
        self.chart["xAxis"]["categories"] = [str(i) for i in range(2011, max(2031, self.trajectory.end + 1))]

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
        self.series.append(
            {
                "name": "Trajectoire",
                "yAxis": 1,
                "color": "#eaa568",
                "zIndex": 5,
                "data": [
                    {"name": str(y), "y": v}
                    for y, v in self.trajectory.get_value_per_year(default=self.annual_objective_2031).items()
                ],
            }
        )
        cumulative_trajectory = {
            "name": "Trajectoire cumulée",
            "color": "#eaa568",
            "type": "line",
            "zIndex": 1,
            "data": [],
        }
        total = self.get_starting_cumulative_value()
        self.trajectory_cumulative = 0
        cpt_year = 0
        for point in self.series[-1]["data"]:
            total += point["y"]
            self.trajectory_cumulative += point["y"]
            cpt_year += 1
            cumulative_trajectory["data"].append({"name": point["name"], "y": total})  # type: ignore
        self.series.append(cumulative_trajectory)
        self.chart["series"] = self.series
        self.trajectory_annual = self.trajectory_cumulative / cpt_year

    def get_data_table(self):
        real = {_["name"]: _["y"] for _ in self.series[0]["data"]}
        added_real = {_["name"]: _["y"] for _ in self.series[1]["data"]}
        objective = {_["name"]: _["y"] for _ in self.series[2]["data"]}
        added_objective = {_["name"]: _["y"] for _ in self.series[3]["data"]}
        trajectory = {_["name"]: _["y"] for _ in self.series[4]["data"]}
        added_trajectory = {_["name"]: _["y"] for _ in self.series[5]["data"]}
        years = set(real.keys()) | set(objective.keys()) | set(added_real.keys())
        years |= set(added_objective.keys()) | set(trajectory.keys()) | set(added_trajectory.keys())
        for year in sorted(years):
            yield {
                "year": year,
                "real": real.get(year, "-"),
                "added_real": added_real.get(year, "-"),
                "objective": objective.get(year, "-"),
                "added_objective": added_objective.get(year, "-"),
                "trajectory": trajectory.get(year, "-"),
                "added_trajectory": added_trajectory.get(year, "-"),
            }
