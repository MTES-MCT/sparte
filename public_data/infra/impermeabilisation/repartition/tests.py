from django.test import TestCase

from public_data.domain.impermeabilisation.repartition.RepartitionOfImpermeabilisation import (
    RepartitionOfImpermeabilisation,
    RepartitionOfImpermeabilisationByCommunesSol,
)

from .highchart.ImperRepartitionMapper import ImperRepartitionMapper


class TestHighchartMapper(TestCase):
    fixtures = [
        "public_data/models/CouvertureSol.json",
        "public_data/models/UsageSol.json",
        "public_data/models/CouvertureUsageMatrix.json",
    ]

    def setUp(self):
        self.repartition = RepartitionOfImpermeabilisation(
            year=2016,
            usage=[
                RepartitionOfImpermeabilisationByCommunesSol(
                    code_prefix="US3", label="Tertiaire", label_short="Tertiaire", surface=2500.0
                ),
            ],
            couverture=[
                RepartitionOfImpermeabilisationByCommunesSol(
                    code_prefix="CS1.1.1.1", label="Zones bâties", label_short="Zones bâties", surface=1000.0
                ),
                RepartitionOfImpermeabilisationByCommunesSol(
                    code_prefix="CS1.1.1.2",
                    label="Zones non bâties (Routes; places; parking…)",
                    label_short="Zones non bâties",
                    surface=1500.0,
                ),
            ],
        )

    def test_map_to_highchart(self):
        result = ImperRepartitionMapper.map(repartition=self.repartition)
        expected_couverture = [
            {
                "name": "Sol imperméable",
                "data": [
                    {
                        "name": "CS1.1.1.1 Zones bâties",
                        "y": 1000.0,
                        "percent": "40%",
                    },
                    {
                        "name": "CS1.1.1.2 Zones non bâties",
                        "y": 1500.0,
                        "percent": "60%",
                    },
                ],
            }
        ]
        expected_usage = [
            {
                "name": "Sol imperméable",
                "data": [
                    {
                        "name": "US3 Tertiaire",
                        "y": 2500.0,
                        "percent": "100%",
                    },
                ],
            }
        ]
        self.assertListEqual(
            expected_couverture,
            result["couverture"],
        )

        self.assertListEqual(
            expected_usage,
            result["usage"],
        )
