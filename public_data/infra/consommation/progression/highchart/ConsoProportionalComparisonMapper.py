from project.charts.constants import HIGHLIGHT_COLOR
from public_data.domain.consommation.entity import ConsommationCollection


class ConsoProportionalComparisonMapper:
    @staticmethod
    def map(land_id_to_highlight: str, consommation_progression: list[ConsommationCollection]):
        highlight_style = {
            "color": HIGHLIGHT_COLOR,
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
                        "y": annual_conso.per_mille_of_area,
                    }
                    for annual_conso in land_conso.consommation
                ],
                "legendIndex": land_conso.land.official_id != land_id_to_highlight,
                **(highlight_style if land_conso.land.official_id == land_id_to_highlight else default_style),
            }
            for land_conso in consommation_progression
        ]
