from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
    ImpermeabilisationDifferenceSol,
)


class ImpermeabilisationDifferenceToHighchartMapper:
    @staticmethod
    def map(difference: ImpermeabilisationDifference) -> dict:
        return {
            "usage": ImpermeabilisationDifferenceToHighchartMapper._map_usage(usage=difference.usage),
            "couverture": ImpermeabilisationDifferenceToHighchartMapper._map_couverture(
                couverture=difference.couverture
            ),
        }

    @staticmethod
    def _map_usage(usage: list[ImpermeabilisationDifferenceSol]):
        return [
            {
                "name": "Imperméabilisation",
                "data": [
                    {
                        "name": item.code_prefix,
                        "y": item.imper,
                    }
                    for item in usage
                ],
            },
            {
                "name": "Désimperméabilisation",
                "data": [
                    {
                        "name": item.code_prefix,
                        "y": item.desimper,
                    }
                    for item in usage
                ],
            },
        ]

    @staticmethod
    def _map_couverture(couverture: list[ImpermeabilisationDifferenceSol]):
        return [
            {
                "name": "Imperméabilisation",
                "data": [
                    {
                        "name": item.code_prefix,
                        "y": item.imper,
                    }
                    for item in couverture
                ],
            },
            {
                "name": "Désimperméabilisation",
                "data": [
                    {
                        "name": item.code_prefix,
                        "y": item.desimper,
                    }
                    for item in couverture
                ],
            },
        ]
