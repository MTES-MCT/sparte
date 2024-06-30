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
                        item.imper * 100 / difference.total_imper,
                        item.desimper,
                        item.desimper * 100 / difference.total_desimper,
                    ],
                }
                for item in sol
            ],
            "footer": [
                difference.total_imper,
                100,
                difference.total_desimper,
                100,
            ],
        }
