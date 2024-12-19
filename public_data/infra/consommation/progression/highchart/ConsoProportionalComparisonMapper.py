from public_data.domain.consommation.entity import ConsommationStatistics


class ConsoProportionalComparisonMapper:
    @staticmethod
    def map(consommation_stats: list[ConsommationStatistics]):
        return [
            {
                "type": "treemap",
                "layoutAlgorithm": "squarified",
                "dataLabels": {
                    "enabled": True,
                    "format": "{point.name}<br />{point.colorValue:.2f} %",
                    "style": {
                        "fontWeight": "bold",
                        "textOutline": "none",
                    },
                },
                "borderWidth": 0,
                "data": [
                    {
                        "name": land_conso.land.name,
                        "value": land_conso.land.area,
                        "colorValue": land_conso.total_percent,
                    }
                    for land_conso in consommation_stats
                ],
            }
        ]
