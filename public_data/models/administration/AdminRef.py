from typing import Literal

from django.apps import apps


class AdminRef:
    REGION = "REGION"
    DEPARTEMENT = "DEPART"
    SCOT = "SCOT"
    EPCI = "EPCI"
    COMMUNE = "COMM"
    COMPOSITE = "COMP"

    CHOICES = (
        (COMMUNE, "Commune"),
        (EPCI, "EPCI"),
        (DEPARTEMENT, "Département"),
        (SCOT, "SCoT"),
        (REGION, "Région"),
        (COMPOSITE, "Composite"),
    )

    CHOICES_DICT = {key: value for key, value in CHOICES}

    @classmethod
    def get_label(cls, key):
        try:
            return cls.CHOICES_DICT[key]
        except KeyError:
            return key

    @classmethod
    def get_form_choices(cls, status_list):
        result = list()
        for status in status_list:
            for key, value in cls.CHOICES:
                if status == key:
                    result.append((key, value))
                    break
        return result

    @classmethod
    def get_class(cls, name):
        if name == cls.REGION:
            return apps.get_model("public_data.Region")
        elif name == cls.DEPARTEMENT:
            return apps.get_model("public_data.Departement")
        elif name == cls.EPCI:
            return apps.get_model("public_data.Epci")
        elif name == cls.COMMUNE:
            return apps.get_model("public_data.Commune")
        elif name == cls.SCOT:
            return apps.get_model("public_data.Scot")
        raise AttributeError(f"{name} is not an administrative layer")

    @classmethod
    def get_analysis_default_level(cls, level) -> Literal["COMM", "EPCI", "SCOT", "DEPART", "REGION"]:
        """
        Return the default analysis level for a given level
        SCOT is never used as default analysis level, as it does not cover France uniformly
        """
        return {
            cls.COMMUNE: cls.COMMUNE,
            cls.EPCI: cls.COMMUNE,
            cls.SCOT: cls.EPCI,
            cls.DEPARTEMENT: cls.EPCI,
            cls.REGION: cls.DEPARTEMENT,
            cls.COMPOSITE: cls.COMMUNE,
        }[level]

    @classmethod
    def get_admin_level(cls, type_list):
        if not isinstance(type_list, set):
            type_list = {_ for _ in type_list}
        if len(type_list) == 1:
            return type_list.pop()
        else:
            return cls.COMPOSITE

    @classmethod
    def get_available_analysis_level(cls, land_type) -> list[str]:
        return {
            cls.COMMUNE: [cls.COMMUNE],
            cls.EPCI: [cls.COMMUNE],
            cls.SCOT: [
                cls.COMMUNE,
                cls.EPCI,
            ],
            cls.DEPARTEMENT: [
                cls.COMMUNE,
                cls.EPCI,
            ],
            cls.REGION: [
                cls.COMMUNE,
                cls.EPCI,
                cls.DEPARTEMENT,
            ],
            cls.COMPOSITE: [
                cls.COMMUNE,
                cls.EPCI,
                cls.DEPARTEMENT,
                cls.REGION,
            ],
        }[land_type]
