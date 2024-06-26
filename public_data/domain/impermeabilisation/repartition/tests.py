from django.test import TestCase

from public_data.models import (
    Commune,
    CommuneSol,
    CouvertureUsageMatrix,
    Departement,
    Region,
)

from .RepartitionOfImpermeabilisation import (
    RepartitionOfImpermeabilisation,
    RepartitionOfImpermeabilisationByCommunesSol,
)
from .RepartitionOfImpermeabilisationService import (
    RepartitionOfImpermeabilisationService,
)


class TestRepartitionOfImpermeabilisationService(TestCase):
    fixtures = [
        "public_data/models/CouvertureSol.json",
        "public_data/models/UsageSol.json",
        "public_data/models/CouvertureUsageMatrix.json",
    ]

    def setUp(self):
        self.year = 2016
        occitanie = Region.objects.create(source_id="76", name="Occitanie", mpoly="MULTIPOLYGON EMPTY")
        gers = Departement.objects.create(
            source_id="32",
            name="Gers",
            mpoly="MULTIPOLYGON EMPTY",
            region=occitanie,
        )
        auch = Commune.objects.create(
            insee="32013",
            name="Auch",
            mpoly="MULTIPOLYGON EMPTY",
            departement=gers,
        )
        CommuneSol.objects.create(
            city=auch,
            year=self.year,
            matrix=CouvertureUsageMatrix.objects.filter(
                couverture__code_prefix="CS1.1.1.1", usage__code_prefix="US3"
            ).first(),
            surface=1000,
        )
        CommuneSol.objects.create(
            city=auch,
            year=self.year,
            matrix=CouvertureUsageMatrix.objects.filter(
                couverture__code_prefix="CS1.1.1.2", usage__code_prefix="US3"
            ).first(),
            surface=1500,
        )

        self.communes = [auch]

    def test_get_by_communes(self):
        expected = RepartitionOfImpermeabilisation(
            year=self.year,
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

        result = RepartitionOfImpermeabilisationService.get_by_communes(communes=self.communes, year=2016)

        self.assertEqual(expected.usage, result.usage)

        self.assertEqual(expected.couverture, result.couverture)
