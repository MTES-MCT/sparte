from public_data.domain.consommation.progression.ConsommationProgression import (
    ConsommationProgressionLand,
)


class ConsoComparisonMapper:
    @staticmethod
    def map(land_id_to_highlight: str, consommation_progression: list[ConsommationProgressionLand]):
        highlight_style = {
            "color": "#ff0000",
            "dashStyle": "ShortDash",
            "lineWidth": 4,
        }
        default_style = {}
        return [
            {
                "name": land_conso.land.name,
                "data": [
                    {
                        "name": annual_conso.year,
                        "y": annual_conso.total,
                    }
                    for annual_conso in land_conso.consommation
                ],
                "legendIndex": land_conso.land.official_id != land_id_to_highlight,
                **(highlight_style if land_conso.land.official_id == land_id_to_highlight else default_style),
            }
            for land_conso in consommation_progression
        ]
