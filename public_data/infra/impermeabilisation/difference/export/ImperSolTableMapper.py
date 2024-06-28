from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
    ImpermeabilisationDifferenceSol,
)


class ImperSolTableMapper:
    @staticmethod
    def map(difference: ImpermeabilisationDifference) -> dict:
        return {
            "usage": ImperSolTableMapper._map_sol(difference=difference, sol=difference.usage),
            "couverture": ImperSolTableMapper._map_sol(difference=difference, sol=difference.couverture),
        }

    @staticmethod
    def _map_sol(difference: ImpermeabilisationDifference, sol: list[ImpermeabilisationDifferenceSol]):
        total_imper = sum(item.imper for item in difference.usage)
        total_desimper = sum(item.desimper for item in difference.usage)
        return {
            "headers": [
                "Imperméabilisation (en ha)",
                "%",
                "Désimperméabilisation (en ha)",
                "%",
            ],
            "rows": [
                {
                    "name": f"{item.code_prefix} {item.label_short}",
                    "data": [
                        item.imper,
                        item.imper * 100 / total_imper,
                        item.desimper,
                        item.desimper * 100 / total_desimper,
                    ],
                }
                for item in sol
            ],
            "footer": [
                total_imper,
                100,
                total_desimper,
                100,
            ],
        }
