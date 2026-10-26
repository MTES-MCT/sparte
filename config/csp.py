"""Politique de sécurité du contenu (Content-Security-Policy) de l'application.

django-csp 4 ne lit plus les anciens réglages ``CSP_*`` : la politique est décrite ici au
format ``CONTENT_SECURITY_POLICY = {"DIRECTIVES": {...}}`` puis branchée dans
``config/settings.py``. Hors environnement local, seules des sources HTTPS/WSS sont
autorisées et ``upgrade-insecure-requests`` demande au navigateur de passer en HTTPS toute
requête qui serait encore émise en HTTP.
"""

from typing import Any

from csp.constants import NONCE, SELF, UNSAFE_INLINE

METABASE = "https://sparte-metabase.osc-secnum-fr1.scalingo.io"
MATOMO = "https://stats.beta.gouv.fr"
CRISP_CLIENT = "https://client.crisp.chat"
# Widget Messages de l'ANCT (La Suite)
LA_SUITE = "https://beta.gouv.fr"
# Serveur de développement webpack (bundle, styles, rechargement à chaud), servi en HTTP
WEBPACK_DEV_SERVER = "http://localhost:3000"
WEBPACK_DEV_SERVER_WS = "ws://localhost:3000/ws"


def build_csp_directives(
    *,
    local: bool,
    media_url: str,
    airflow_s3_base_url: str,
    s3_endpoint_url: str,
    report_uri: str = "",
) -> dict[str, Any]:
    """Construit les directives CSP.

    ``local`` (``ENVIRONMENT == "local"``) tolère le serveur de développement webpack et le
    S3 local, tous deux servis en HTTP ; partout ailleurs aucune source ``http:``/``ws:``
    n'est autorisée et ``upgrade-insecure-requests`` est ajouté.

    ``report_uri`` (optionnel) est l'adresse où le navigateur envoie les rapports de
    violation (ex. l'endpoint « security » d'un projet Sentry) ; utile surtout en mode
    Report-Only pour collecter les violations sans surveiller la console du navigateur.
    """
    directives: dict[str, Any] = {
        "default-src": [SELF, METABASE, "blob:", MATOMO],
        "worker-src": [SELF, "blob:"],
        "script-src": [SELF, MATOMO, CRISP_CLIENT, "https://settings.crisp.chat", LA_SUITE, NONCE],
        "style-src": [SELF, UNSAFE_INLINE, "https://cdn.jsdelivr.net", CRISP_CLIENT, MATOMO, LA_SUITE],
        "img-src": [
            SELF,
            "data:",
            "https://data.geopf.fr",
            "https://s3.fr-par.scw.cloud",
            media_url,
            CRISP_CLIENT,
            "https://image.crisp.chat",
            "https://storage.crisp.chat",
            LA_SUITE,
            airflow_s3_base_url,
        ],
        "frame-src": [SELF, "https://game.crisp.chat", "https://plugins.crisp.chat", METABASE, MATOMO],
        "media-src": [CRISP_CLIENT],
        "font-src": [SELF, "data:", "https://cdn.jsdelivr.net", CRISP_CLIENT, MATOMO],
        "connect-src": [
            SELF,
            LA_SUITE,
            METABASE,
            MATOMO,
            "https://data.geopf.fr",
            "https://raw.githack.com",
            "https://openmaptiles.geo.data.gouv.fr",
            "https://openmaptiles.github.io",
            "https://s3.fr-par.scw.cloud",
            "https://sparte.s3.fr-par.scw.cloud",
            CRISP_CLIENT,
            "https://storage.crisp.chat",
            "wss://client.relay.crisp.chat",
            "wss://stream.relay.crisp.chat",
            # Widget Messages de l'ANCT
            "https://support.incubateur.net",
            "https://gist.githubusercontent.com",
            airflow_s3_base_url,
        ],
        "frame-ancestors": [SELF, METABASE, MATOMO],
        # Aucun formulaire ne doit être soumis vers un domaine tiers (ex. l'export de graphiques
        # Highcharts, qui par défaut POSTe vers export.highcharts.com).
        "form-action": [SELF],
    }
    if local:
        for directive in ("script-src", "style-src", "img-src", "font-src", "connect-src"):
            directives[directive].append(WEBPACK_DEV_SERVER)
        directives["connect-src"].append(WEBPACK_DEV_SERVER_WS)
        if s3_endpoint_url.startswith("http://"):
            directives["img-src"].append(s3_endpoint_url)
            directives["connect-src"].append(s3_endpoint_url)
    else:
        # block-all-mixed-content est déprécié et ignoré par les navigateurs qui gèrent
        # upgrade-insecure-requests : seule cette dernière directive est posée.
        directives["upgrade-insecure-requests"] = True
    if report_uri:
        directives["report-uri"] = [report_uri]
    return directives
