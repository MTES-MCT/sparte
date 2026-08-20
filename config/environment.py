from django.conf import settings


def get_environment() -> dict:
    """Configuration d'environnement exposée au front, via l'endpoint `/env`.

    Source de vérité unique pour les URL de données servies depuis le bucket
    Airflow. Le front les portait auparavant dans des constantes codées en dur
    (`frontend/scripts/components/map/constants/config.ts`), identiques en
    staging et en production : viser un autre bucket supposait de modifier le
    bundle, et le bucket ainsi visé pouvait diverger de la liste d'autorisation
    CSP, auquel cas les tuiles étaient silencieusement bloquées.

    Côté front, `BaseMap` consomme ces valeurs avec `useGetEnvironmentQuery` et
    les injecte dans le module de configuration de la carte avant d'initialiser
    celle-ci.
    """
    return {
        "vector_tiles_location": settings.VECTOR_TILES_LOCATION,
        "geojson_location": settings.GEOJSON_LOCATION,
        "matomo_container_src": settings.MATOMO_CONTAINER_SRC,
    }
