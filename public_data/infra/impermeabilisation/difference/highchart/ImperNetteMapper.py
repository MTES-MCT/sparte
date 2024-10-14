from project.charts.constants import (
    ARTIFICIALISATION_COLOR,
    ARTIFICIALISATION_NETTE_COLOR,
    DESARTIFICIALISATION_COLOR,
)
from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
)


class ImperNetteMapper:
    @staticmethod
    def map(difference: ImpermeabilisationDifference) -> list:
        years_str = f"{difference.start_date} - {difference.end_date}"

        total_imper = difference.total_imper
        total_desimper = difference.total_desimper
        imper_nette = difference.imper_nette

        total_imper_data = [{"name": years_str, "y": total_imper}] if total_imper else []
        total_desimper_data = [{"name": years_str, "y": total_desimper}] if total_desimper else []
        imper_nette_data = [{"name": years_str, "y": imper_nette}] if imper_nette else []

        return [
            {
                "name": "Imperméabilisation",
                "data": total_imper_data,
                "color": ARTIFICIALISATION_COLOR,
            },
            {
                "name": "Désimperméabilisation",
                "data": total_desimper_data,
                "color": DESARTIFICIALISATION_COLOR,
            },
            {
                "name": "Imperméabilisation nette",
                "data": imper_nette_data,
                "color": ARTIFICIALISATION_NETTE_COLOR,
            },
        ]
