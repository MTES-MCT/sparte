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
                "color": "#ff0000",
            },
            {
                "name": "Désimperméabilisation",
                "data": total_desimper_data,
                "color": "#00ff00",
            },
            {
                "name": "Imperméabilisation nette",
                "data": imper_nette_data,
                "color": "#0000ff",
            },
        ]
