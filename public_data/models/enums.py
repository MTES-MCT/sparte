from django.db import models


class SRID(models.IntegerChoices):
    LAMBERT_93 = 2154, "France Métropolitaine et Corse"
    WGS_84_UTM_ZONE_20 = 32620, "Guadeloupe et Martinique"
    RGFG_95_UTM_ZONE_22N = 2972, "Guyane Française"
    RGR_92_UTM_ZONE_40S = 2975, "La réunion"
    WGS_84 = 4326, "Monde (GPS)"
    WEB_MERCATOR = 3857, "Monde (Google Maps, OpenStreetMap etc.)"
