from .ImperProgressionByCouvertureChart import (
    ImperProgressionByCouvertureChart,
    ImperProgressionByCouvertureChartExport,
)


class ImperProgressionByUsageChart(ImperProgressionByCouvertureChart):
    _sol = "usage"

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": (
                    f"Evolution de l'imperméabilisation par type d'usage de {self.project.first_year_ocsge} à "
                    f"{self.project.last_year_ocsge}"
                )
            }
        }


class ImperProgressionByUsageChartExport(ImperProgressionByCouvertureChartExport):
    _sol = "usage"

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": (
                    f"Evolution de l'imperméabilisation par type d'usage de {self.project.first_year_ocsge} à "
                    f"{self.project.last_year_ocsge} à {self.project.territory_name}"
                )
            },
        }
