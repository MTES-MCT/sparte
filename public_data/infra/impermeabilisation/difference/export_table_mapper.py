from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
    ImpermeabilisationDifferenceSol,
)


class ImpermeabilisationDifferenceToExportTableMapper:
    @staticmethod
    def map(difference: ImpermeabilisationDifference) -> dict:
        return {
            "usage": ImpermeabilisationDifferenceToExportTableMapper._map_sol(
                difference=difference, sol=difference.usage
            ),
            "couverture": ImpermeabilisationDifferenceToExportTableMapper._map_sol(
                difference=difference, sol=difference.couverture
            ),
        }

    @staticmethod
    def _map_sol(difference: ImpermeabilisationDifference, sol: list[ImpermeabilisationDifferenceSol]):
        total_imper = sum(item.imper for item in difference.usage)
        total_desimper = sum(item.desimper for item in difference.usage)
        return {
            "headers": [
                "",
                "Imperméabilisation",
                "%",
                "Désimperméabilisation",
                "%",
            ],
            "rows": [
                [
                    f"{item.code_prefix} {item.label_short}",
                    {item.imper},
                    f"{item.imper * 100 / total_imper}%",
                    {item.desimper},
                    f"{item.desimper * 100 / total_desimper}%",
                ]
                for item in sol
            ],
            "footer": [
                "Total",
                total_imper,
                "100%",
                total_desimper,
                "100%",
            ],
        }
