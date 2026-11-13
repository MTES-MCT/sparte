from typing import Any

from django.core.cache.backends.dummy import DummyCache


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


def build_caches(redis_url: str | None) -> dict[str, Any]:
    """Réglage ``CACHES`` : Redis si une URL est donnée, sinon un cache factice.

    Sans URL, rien n'est mis en cache et aucun appel ne part vers Redis : le site reste servi
    quand l'addon est en panne ou en maintenance. ``RedisDummyCache`` garde les méthodes
    propres à django-redis (``delete_pattern``…) que le code appelle.
    """
    if redis_url is None:
        return {"default": {"BACKEND": "config.cache_backends.RedisDummyCache"}}
    return {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": redis_url,
            "TIMEOUT": 60 * 15,  # 15 minutes
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "MAX_ENTRIES": 1000,
            },
        }
    }
