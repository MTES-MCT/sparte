from django.db import models


class SRID(models.IntegerChoices):
    LAMBERT_93 = 2154  # France métropolitaine et Corse
    WGS_84_UTM_ZONE_20 = 32620  # Guadeloupe (971) et Martinique (972)
    RGFG_95_UTM_ZONE_22N = 2972  # Guyane Française (973)
    RGR_92_UTM_ZONE_40S = 2975  # La Réunion (974)
    WGS_84 = 4326  # Monde (GPS)
    WEB_MERCATOR = 3857  # Monde (Google Maps, OpenStreetMap, Bing Maps, MapQuest, etc.)
