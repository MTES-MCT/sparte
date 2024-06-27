from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
)


class ImperNetteMapper:
    @staticmethod
    def map(difference: ImpermeabilisationDifference) -> list:
        total_imper = sum(item.imper for item in difference.usage + difference.couverture)
        total_desimper = sum(item.desimper for item in difference.usage + difference.couverture)
        imper_nette = total_imper - total_desimper

        years_str = f"{difference.start_date} - {difference.end_date}"

        return [
            {"name": "Imperméabilisation", "data": [{"name": years_str, "y": total_imper}], "color": "#ff0000"},
            {"name": "Désimperméabilisation", "data": [{"name": years_str, "y": total_desimper}], "color": "#00ff00"},
            {"name": "Imperméabilisation nette", "data": [{"name": years_str, "y": imper_nette}], "color": "#0000ff"},
        ]
