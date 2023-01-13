import logging
import re

from django.core.management.base import BaseCommand

from public_data.models import CouvertureSol, UsageSol


logger = logging.getLogger("management.commands")


DATA_COUV = [
    [24, "1", "Sans végétation", "Sans végétation", "#ff377a", None],
    [25, "1.1", "Surfaces anthropisées", "Surfaces anthropisées", "#ff377a", 24],
    [26, "1.1.1", "Zones imperméables", "Zones imperméables", "#ff377a", 25],
    [27, "1.1.1.1", "Zones bâties", "Zones bâties", "#ff377a", 26],
    [
        28,
        "1.1.1.2",
        "Zones non bâties (Routes, places, parking…)",
        "Zones non bâties",
        "#ff9191",
        26,
    ],
    [29, "1.1.2", "Zones perméables", "Zones perméables", "#ff9", 25],
    [
        30,
        "1.1.2.1",
        "Zones à matériaux minéraux",
        "Zones à matériaux minéraux",
        "#ff9",
        29,
    ],
    [
        31,
        "1.1.2.2",
        "Zones à autres matériaux composites",
        "Zones à autres matériaux compo...",
        "#a64d00",
        29,
    ],
    [32, "1.2", "Surfaces naturelles", "Surfaces naturelles", "#ccc", 24],
    [
        33,
        "1.2.1",
        "Sols nus (Sable, pierres meubles, rochers saillants…)",
        "Sols nus",
        "#ccc",
        32,
    ],
    [
        34,
        "1.2.2",
        "Surfaces d'eau (Eau continentale et maritime)",
        "Surfaces d'eau",
        "#00ccf2",
        32,
    ],
    [35, "1.2.3", "Névés et glaciers", "Névés et glaciers", "#a6e6cc", 32],
    [36, "2", "Avec végétation", "Avec végétation", "#80ff00", None],
    [37, "2.1", "Végétation ligneuse", "Végétation ligneuse", "#80ff00", 36],
    [38, "2.1.1", "Formations arborées", "Formations arborées", "#80be00", 37],
    [39, "2.1.1.1", "Peuplement de feuillus", "Peuplement de feuillus", "#80ff00", 38],
    [
        40,
        "2.1.1.2",
        "Peuplement de conifères",
        "Peuplement de conifères",
        "#00a600",
        38,
    ],
    [41, "2.1.1.3", "Peuplement mixte", "Peuplement mixte", "#80be00", 38],
    [
        42,
        "2.1.2",
        (
            "Formations arbustives et sous-arbrisseaux (Landes basses, formations "
            "arbustives, formations arbustives organisées…)"
        ),
        "Formations arbustives",
        "#a6ff80",
        37,
    ],
    [
        43,
        "2.1.3",
        "Autres formations ligneuses (Vignes et autres lianes)",
        "Autres formations ligneuses",
        "#e68000",
        37,
    ],
    [44, "2.2", "Végétation non ligneuse", "Végétation non ligneuse", "#ccf24d", 36],
    [
        45,
        "2.2.1",
        "Formations herbacées (Pelouses et prairies, terres arables, roselières…)",
        "Formations herbacées",
        "#ccf24d",
        44,
    ],
    [
        46,
        "2.2.2",
        "Autres formations non ligneuses (Lichen, mousse, bananiers, bambous...)",
        "Autres formations non ligneuses",
        "#cfc",
        44,
    ],
    # [47, "2.2.1.1", "Prairies", "Prairies", "#ccf24d", 45],
    # [48, "2.2.1.2", "Pelouses herbes rases", "Pelouses", "#ccf24d", 45],
    # [49, "2.2.1.4", "Terres arables", "Terres arables", "#ccf24d", 45],
    # [50, "2.2.1.5", "Autres formations herbacées", "Autres herbacées", "#ccf24d", 45],
    # [
    #     51,
    #     "2.2.1.3",  # Pas certain qu'elle existe cette couverture, demander doc.
    #     "Formations herbacées inconnues",
    #     "Formations herbacées inconnues",
    #     "#ccf24d",
    #     45,
    # ],
    # [52, "2.1.3.1", "Vignes", "Vignes", "#e68000", 43],
    # [53, "2.1.3.2", "Autres lianes", "Autres lianes", "#e68000", 43],
]
DATA_USAGE = [
    [20, "1", "Production primaire", "Production primaire", "green", None],
    [21, "1.1", "Agriculture", "Agriculture", "#ffffa8", 20],
    [22, "1.2", "Sylviculture", "Sylviculture", "green", 20],
    [23, "1.3", "Activités d’extraction", "Activités d’extraction", "#a600cc", 20],
    [24, "1.4", "Pêche et aquaculture", "Pêche et aquaculture", "#009", 20],
    [25, "1.5", "Autre", "Autre", "#963", 20],
    [26, "2", "Secondaire", "Secondaire", "#e6004d", None],
    [
        27,
        "235",
        "Production secondaire, tertiaire et usage résidentiel",
        "Production secondaire, tertiai...",
        "#e6004d",
        None,
    ],
    [28, "3", "Tertiaire", "Tertiaire", "#e6004d", None],
    [
        29,
        "4",
        "Réseaux de transport logistiques et infrastructures",
        "Réseaux de transport logistiqu...",
        "#c00",
        None,
    ],
    [30, "4.1", "Réseaux de transport", "Réseaux de transport", "#c00", 29],
    [
        31,
        "4.2",
        "Services de logistique et de stockage",
        "Services de logistique et de s...",
        "red",
        29,
    ],
    [
        32,
        "4.3",
        "Réseaux d’utilité publique",
        "Réseaux d’utilité publique",
        "#ff4b00",
        29,
    ],
    [33, "5", "Résidentiel", "Résidentiel", "#e6004d", None],
    [34, "6", "Autre usage", "Autre usage", "#fc0", None],
    [35, "6.1", "Zones en transition", "Zones en transition", "#ff4dff", 34],
    [36, "6.2", "Zones abandonnées", "Zones abandonnées", "#404040", 34],
    [37, "6.3", "Sans usage", "Sans usage", "#f0f028", 34],
    [38, "6.6", "Usage Inconnu", "Usage Inconnu", "#fc0", 34],
    [39, "4.1.1", "Routier", "Routier", "#c00", 30],
    [40, "4.1.2", "Ferré", "Ferré", "#5a5a5a", 30],
    [41, "4.1.3", "Aérien", "Aérien", "#e6cce6", 30],
    [42, "4.1.4", "Eau", "Eau", "#06f", 30],
    [
        43,
        "4.1.5",
        "Autres réseaux de transport",
        "Autres réseaux de transport",
        "#603",
        30,
    ],
    # [
    #     44,
    #     "1.1.3",
    #     "Surface agricole utilisée",
    #     "Surface agricole utilisée",
    #     "#ffffa8",
    #     21,
    # ],
    # [45, "1.1.4", "Jachère", "Jachère", "#ffffa8", 21],
    # [46, "1.2.1.2", "Peupleraie", "Peupleraie", "green", 22],
]


def build_short_label(label):
    label_short = re.sub(r"\(.*\)", "", label).strip()

    if len(label_short) < 30:
        return label_short
    else:
        return f"{label_short[:30]}..."


class Command(BaseCommand):
    help = "Load Usage and Couverture referentials"

    def handle(self, *args, **options):
        logger.info("Start uploading CSV usage and couverture")
        logger.info("Process couverture")
        self.load(DATA_COUV, CouvertureSol)
        logger.info("Process usage")
        self.load(DATA_USAGE, UsageSol)
        logger.info("End uploading CSV usage and couverture")

    def load(self, DATA, klass):
        mapping_parent = dict()
        for row in DATA:
            try:
                item = klass.objects.get(code=row[1])
            except klass.DoesNotExist:
                item = klass(pk=row[0])
            item.code = row[1]
            item.code_prefix = f"{klass.prefix}{row[1]}"
            item.label = row[2]
            item.label_short = row[3]
            item.map_color = row[4]
            if row[5]:
                item.parent = mapping_parent[row[5]]
            mapping_parent |= {row[0]: item}
            item.save()
            logger.debug("Done %s", item)
