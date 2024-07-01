from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
)


class ImperNetteMapper:
    @staticmethod
    def map(difference: ImpermeabilisationDifference) -> list:
        years_str = f"{difference.start_date} - {difference.end_date}"

        return [
            {
                "name": "Imperméabilisation",
                "data": [{"name": years_str, "y": difference.total_imper}],
                "color": "#ff0000",
            },
            {
                "name": "Désimperméabilisation",
                "data": [{"name": years_str, "y": difference.total_desimper}],
                "color": "#00ff00",
            },
            {
                "name": "Imperméabilisation nette",
                "data": [{"name": years_str, "y": difference.imper_nette}],
                "color": "#0000ff",
            },
        ]
