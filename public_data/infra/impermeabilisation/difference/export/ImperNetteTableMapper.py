from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
)


class ImperNetteTableMapper:
    @staticmethod
    def map(difference: ImpermeabilisationDifference) -> dict:
        years_str = f"{difference.start_date} - {difference.end_date}"

        return {
            "header": years_str,
            "rows": [
                {
                    "name": "Imperméabilisation (en ha)",
                    "value": difference.total_imper,
                },
                {
                    "name": "Désimperméabilisation (en ha)",
                    "value": difference.total_desimper,
                },
                {
                    "name": "Imperméabilisation nette (en ha)",
                    "value": difference.imper_nette,
                },
            ],
        }
