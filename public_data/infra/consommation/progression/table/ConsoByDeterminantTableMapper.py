from django.template.loader import render_to_string

from public_data.domain.consommation.entity import ConsommationCollection


class ConsoByDeterminantTableMapper:
    @staticmethod
    def map(consommation_progression: list[ConsommationCollection]):
        category_to_attr = {
            "Habitat": "habitat",
            "Activité": "activite",
            "Mixte": "mixte",
            "Route": "route",
            "Ferré": "ferre",
            "Inconnu": "non_reseigne",
            "Total": "total",
        }

        headers = ["Destination"] + [str(conso.year) for conso in consommation_progression] + ["Total"]

        data = []
        for category in category_to_attr:
            category_values = [getattr(conso, category_to_attr[category]) for conso in consommation_progression]
            category_total = sum(category_values)
            # On arrondit ensuite pour ne pas fausser le total
            category_values_rounded = [round(value, 2) for value in category_values]
            category_total_rounded = round(category_total, 2)
            data.append([category] + category_values_rounded + [category_total_rounded])

        return render_to_string(
            "public_data/partials/conso_by_determinant_table.html",
            {
                "headers": headers,
                "data": data,
            },
        )
