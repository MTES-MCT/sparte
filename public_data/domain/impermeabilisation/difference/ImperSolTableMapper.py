from django.template.loader import render_to_string

from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
    ImpermeabilisationDifferenceSol,
)


class ImperSolTableMapper:
    @staticmethod
    def map(difference: ImpermeabilisationDifference) -> dict:
        return {
            "usage": ImperSolTableMapper._map_sol(
                difference=difference, sol=difference.usage, label_caption="d'usage"
            ),
            "couverture": ImperSolTableMapper._map_sol(
                difference=difference, sol=difference.couverture, label_caption="de couverture"
            ),
        }

    @staticmethod
    def _map_sol(
        difference: ImpermeabilisationDifference, sol: list[ImpermeabilisationDifferenceSol], label_caption: str
    ) -> str:
        sol_with_percentages = []
        for item in sol:
            sol_with_percentages.append(
                {
                    "label": f"{item.code_prefix} {item.label_short}",
                    "imper": item.imper,
                    "imper_percent": (item.imper * 100 / difference.total_imper) if difference.total_imper > 0 else 0,
                    "desimper": item.desimper,
                    "desimper_percent": (
                        (item.desimper * 100 / difference.total_desimper) if difference.total_desimper > 0 else 0
                    ),
                }
            )

        context = {
            "start_date": str(difference.start_date),
            "end_date": str(difference.end_date),
            "total_imper": difference.total_imper,
            "total_desimper": difference.total_desimper,
            "label_caption": label_caption,
            "sol": sol_with_percentages,
        }

        return render_to_string("public_data/partials/imper_sol_table.html", context)
