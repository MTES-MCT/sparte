from public_data.domain.consommation.entity import ConsommationStatistics


class ConsoProportionalComparisonMapper:
    @staticmethod
    def map(consommation_stats: list[ConsommationStatistics]):
        return [
            {
                "type": "treemap",
                "layoutAlgorithm": "squarified",
                "clip": False,
                "dataLabels": {
                    "enabled": True,
                    "format": "{point.name}<br />{point.value:.2f} ‰",
                    "style": {
                        "fontWeight": "bold",
                        "textOutline": "none",
                    },
                },
                "borderWidth": 0,
                "data": [
                    {
                        "name": land_conso.land.name,
                        "value": land_conso.per_mille_of_area,
                        "colorValue": land_conso.per_mille_of_area,
                    }
                    for land_conso in consommation_stats
                ],
            }
        ]
