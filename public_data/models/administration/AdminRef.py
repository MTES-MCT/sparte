from django.apps import apps


class AdminRef:
    REGION = "REGION"
    DEPARTEMENT = "DEPART"
    SCOT = "SCOT"
    EPCI = "EPCI"
    COMMUNE = "COMM"
    COMPOSITE = "COMP"
    NATION = "NATION"
    CUSTOM = "CUSTOM"

    CHOICES = (
        (COMMUNE, "Commune"),
        (EPCI, "EPCI"),
        (DEPARTEMENT, "Département"),
        (SCOT, "SCoT"),
        (REGION, "Région"),
        (NATION, "Nation"),
        (COMPOSITE, "Composite"),
        (CUSTOM, "Personnalisé"),
    )

    CHOICES_DICT = {key: value for key, value in CHOICES}

    SLUG_TO_CODE = {
        "commune": COMMUNE,
        "epci": EPCI,
        "departement": DEPARTEMENT,
        "scot": SCOT,
        "region": REGION,
        "nation": NATION,
    }
    CODE_TO_SLUG = {v: k for k, v in SLUG_TO_CODE.items()}

    @classmethod
    def slug_to_code(cls, slug: str) -> str:
        return cls.SLUG_TO_CODE.get(slug, slug)

    @classmethod
    def code_to_slug(cls, code: str) -> str:
        return cls.CODE_TO_SLUG.get(code, code.lower())

    @classmethod
    def get_label(cls, key):
        try:
            return cls.CHOICES_DICT[key]
        except KeyError:
            return key

    @classmethod
    def get_class(cls, name):
        return apps.get_model("public_data.LandModel")
