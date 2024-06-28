from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
)


class ImperNetteTableMapper:
    @staticmethod
    def map(difference: ImpermeabilisationDifference) -> list:
        # TODO : Manage multiple difference
        total_imper = sum(item.imper for item in difference.usage + difference.couverture)
        total_desimper = sum(item.desimper for item in difference.usage + difference.couverture)
        imper_nette = total_imper - total_desimper

        years_str = f"{difference.start_date} - {difference.end_date}"

        return {
            "header": years_str,
            "rows": [
                {
                    "name": "Imperméabilisation (en ha)",
                    "value": total_imper,
                },
                {
                    "name": "Désimperméabilisation (en ha)",
                    "value": total_desimper,
                },
                {
                    "name": "Imperméabilisation nette (en ha)",
                    "value": imper_nette,
                },
            ],
        }
