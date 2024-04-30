from public_data.models import UsageSol

from .CouvertureChangeWheelChart import CouvertureChangeWheelChart


class UsageChangeWheelChart(CouvertureChangeWheelChart):
    name = "Matrice de passage de l'usage"
    prefix = "us"
    name_sol = "usage"
    items = UsageSol.objects.all()

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": (
                    "Matrice d'évolution de l'usage des sols de "
                    f"{self.project.first_year_ocsge} à {self.project.last_year_ocsge}"
                )
            },
        }

    def get_serie_label(self, code_prefix) -> str:
        return f"{code_prefix} {UsageSol.objects.get(code_prefix=code_prefix).label_short}"


class UsageChangeWheelChartExport(UsageChangeWheelChart):
    pass  # TODO
