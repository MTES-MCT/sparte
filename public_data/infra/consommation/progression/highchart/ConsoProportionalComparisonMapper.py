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
                    "format": "{point.name}<br />{point.colorValue:.2f} %",
                    "style": {
                        "fontWeight": "bold",
                        "textOutline": "none",
                    },
                },
                "data": [
                    {
                        "name": land_conso.land.name,
                        "value": land_conso.land.area,
                        "colorValue": land_conso.total_percent_of_area,
                    }
                    for land_conso in consommation_stats
                ],
                "states": {
                    "hover": {
                        "enabled": False,
                    }
                },
                "borderWidth": 1,
                "borderColor": "#A1A1F8",
            }
        ]
