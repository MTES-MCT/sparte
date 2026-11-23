import logging
from typing import Any

from django.core.cache.backends.dummy import DummyCache
from django_redis.cache import RedisCache
from redis.exceptions import ConnectionError as RedisConnectionError


class RedisDummyCache(DummyCache):
    def ttl(self, key):
        return 0

    def delete_pattern(self, pattern, version=None):
        return None

    def get_or_set(self, key, default, timeout=None):
        return default() if callable(default) else default

    def reinsert_keys(self):
        return None

    def persist(self, key):
        return True

    def expire(self, key, timeout):
        return True


class LoggingRedisCache(RedisCache):
    """Cache Redis qui journalise toujours les erreurs qu'il ignore.

    Avec ``IGNORE_EXCEPTIONS``, django-redis ne journalise une erreur ignorée que si le réglage
    global ``DJANGO_REDIS_LOG_IGNORED_EXCEPTIONS`` est posé. Ici la journalisation ne dépend
    d'aucun réglage : une panne de Redis ne peut pas passer inaperçue.
    """

    def __init__(self, server, params) -> None:
        super().__init__(server, params)
        self._log_ignored_exceptions = True
        self.logger = logging.getLogger("django_redis.cache")


def build_caches(redis_url: str | None) -> dict[str, Any]:
    """Réglage ``CACHES`` : Redis si une URL est donnée, sinon un cache factice.

    Sans URL, rien n'est mis en cache et aucun appel ne part vers Redis : le site reste servi
    quand l'addon est en panne ou en maintenance. ``RedisDummyCache`` garde les méthodes
    propres à django-redis (``delete_pattern``…) que le code appelle.

    Avec une URL, une erreur de Redis (connexion fermée, délai dépassé, chargement des données
    après un redémarrage) ne fait plus échouer la requête : django-redis l'ignore et répond
    comme un cache vide. L'erreur est journalisée au niveau ERROR (``LoggingRedisCache``),
    donc envoyée à Sentry.
    """
    if redis_url is None:
        return {"default": {"BACKEND": "config.cache_backends.RedisDummyCache"}}
    return {
        "default": {
            "BACKEND": "config.cache_backends.LoggingRedisCache",
            "LOCATION": redis_url,
            "TIMEOUT": 60 * 15,  # 15 minutes
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "MAX_ENTRIES": 1000,
                "IGNORE_EXCEPTIONS": True,
                # Sans délai, un Redis qui ne répond plus bloque le worker jusqu'au délai de gunicorn.
                "SOCKET_CONNECT_TIMEOUT": 1,
                "SOCKET_TIMEOUT": 2,
                # Une connexion coupée en cours de commande est rouverte et la commande rejouée une fois.
                # Effet de bord de redis-py : l'ouverture de connexion est elle aussi retentée une fois,
                # donc un port muet coûte 2 x SOCKET_CONNECT_TIMEOUT.
                "CONNECTION_POOL_KWARGS": {"retry_on_error": [RedisConnectionError]},
            },
        }
    }
