from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
    ImpermeabilisationDifferenceSol,
)


class ImperProgressionMapper:
    @staticmethod
    def map(difference: ImpermeabilisationDifference) -> dict:
        return {
            "usage": ImperProgressionMapper._map_usage(usage=difference.usage),
            "couverture": ImperProgressionMapper._map_couverture(couverture=difference.couverture),
        }

    @staticmethod
    def _map_usage(usage: list[ImpermeabilisationDifferenceSol]):
        return [
            {
                "name": "Imperméabilisation",
                "data": [
                    {
                        "name": f"{item.code_prefix} {item.label_short}",
                        "y": item.imper,
                    }
                    for item in usage
                ],
            },
            {
                "name": "Désimperméabilisation",
                "data": [
                    {
                        "name": f"{item.code_prefix} {item.label_short}",
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
                        "name": f"{item.code_prefix} {item.label_short}",
                        "y": item.imper,
                    }
                    for item in couverture
                ],
            },
            {
                "name": "Désimperméabilisation",
                "data": [
                    {
                        "name": f"{item.code_prefix} {item.label_short}",
                        "y": item.desimper,
                    }
                    for item in couverture
                ],
            },
        ]
