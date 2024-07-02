from django.template.loader import render_to_string

from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
)


class ImperNetteTableMapper:
    @staticmethod
    def map(difference: ImpermeabilisationDifference) -> str:
        context = {
            "start_date": str(difference.start_date),
            "end_date": str(difference.end_date),
            "total_imper": difference.total_imper,
            "total_desimper": difference.total_desimper,
            "imper_nette": difference.imper_nette,
        }

        return render_to_string("public_data/partials/imper_nette_table.html", context)
