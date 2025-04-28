from typing import Any, Dict, List

from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from public_data.models import LandArtifStockIndex as ArtifStockIndexModel


class ArtifPercentRate(DiagnosticChart):
    @cached_property
    def data(self) -> List[ArtifStockIndexModel]:
        return list(
            ArtifStockIndexModel.objects.filter(
                land_id=self.land.id,
                land_type=self.land.land_type,
                millesime_index=self.params.get("index"),
            )
        )

    @property
    def series(self):
        tiles = []
        total_tiles = 100
        red_tiles = int((self.data[0].percent / 100) * total_tiles)

        columns = 10
        rows = 10
        for i in range(rows):
            for j in range(columns):
                tile_index = i * columns + j
                if tile_index < total_tiles:
                    tiles.append(
                        {
                            "x": j,
                            "y": rows - 1 - i,
                            "value": 1,
                            "color": "#ff4545" if tile_index < red_tiles else "#e0e0e0",
                        }
                    )

        return [
            {
                "name": "Taux d'artificialisation",
                "type": "tilemap",
                "tileShape": "square",
                "data": tiles,
                "groupPadding": 0,
                "states": {"hover": {"enabled": False}},
            }
        ]

    @property
    def param(self) -> Dict[str, Any]:
        return super().param | {
            "chart": {
                "type": "tilemap",
                "backgroundColor": "transparent",
                "marginTop": 20,
            },
            "title": {
                "text": "Surface artificialisée",
                "align": "left",
                "style": {
                    "fontSize": "1rem",
                },
            },
            "legend": {"enabled": False},
            "tooltip": {"enabled": False},
            "xAxis": {
                "visible": False,
            },
            "yAxis": {
                "visible": False,
            },
            "credits": {"enabled": False},
            "series": self.series,
        }
