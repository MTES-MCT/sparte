from public_data.domain.impermeabilisation.repartition.RepartitionOfImpermeabilisation import (
    RepartitionOfImpermeabilisation,
    RepartitionOfImpermeabilisationByCommunesSol,
)


class ImperRepartitionMapper:
    @staticmethod
    def map(repartition: RepartitionOfImpermeabilisation) -> dict:
        return {
            "usage": ImperRepartitionMapper._map_usage(usage=repartition.usage),
            "couverture": ImperRepartitionMapper._map_couverture(couverture=repartition.couverture),
        }

    @staticmethod
    def _map_usage(usage: list[RepartitionOfImpermeabilisationByCommunesSol]):  # -> dict[str, Any]:
        surface_total = sum(item.surface for item in usage)

        return [
            {
                "name": "Sol imperméable",
                "data": [
                    {
                        "name": f"{item.code_prefix} {item.label_short}",
                        "y": item.surface,
                        "percent": f"{int(100 * item.surface / surface_total)}%",
                    }
                    for item in usage
                ],
            }
        ]

    @staticmethod
    def _map_couverture(couverture: list[RepartitionOfImpermeabilisationByCommunesSol]):
        surface_total = sum(item.surface for item in couverture)

        return [
            {
                "name": "Sol imperméable",
                "data": [
                    {
                        "name": f"{item.code_prefix} {item.label_short}",
                        "y": item.surface,
                        "percent": f"{int(100 * item.surface / surface_total)}%",
                    }
                    for item in couverture
                ],
            }
        ]
