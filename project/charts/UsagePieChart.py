from public_data.models import CouvertureSol, UsageSol

from .constants import OCSGE_CREDITS
from .CouverturePieChart import CouverturePieChart


class UsagePieChart(CouverturePieChart):
    _level = 1
    _sol = "usage"


class UsagePieChartExport(UsagePieChart):
    def get_series_item_name(self, item: CouvertureSol | UsageSol) -> str:
        surface_str = f"{item.surface:.2f}".replace(".", ",")
        return f"{item.code_prefix} {item.label} - {surface_str} ha"

    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "title": {
                "text": (
                    f"Répartition de l'usage du sol de {self.project.territory_name}"
                    f" en {self.project.last_year_ocsge} (en ha)"
                )
            },
        }
