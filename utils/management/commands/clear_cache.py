from django.conf import settings
from django.core.cache import DEFAULT_CACHE_ALIAS, caches
from django.core.cache.backends.base import InvalidCacheBackendError
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """A simple management command which clears the site-wide cache."""

    help = "Fully clear site-wide cache."

    def handle(self, *args, **kwargs):
        cache = getattr(settings, "CACHES", {DEFAULT_CACHE_ALIAS: {}}).keys()

        for key in cache:
            try:
                backend = caches[key]
                if hasattr(backend, "client"):
                    # django-redis ignore les erreurs de Redis (IGNORE_EXCEPTIONS) : passer par le
                    # client redis-py pour qu'un cache non vidé au déploiement reste une erreur
                    # visible. FLUSHDB ASYNC répond tout de suite, même sur une grosse base : le
                    # vidage ne dépasse pas SOCKET_TIMEOUT et ne bloque pas Redis pour le site.
                    backend.client.get_client(write=True).flushdb(asynchronous=True)
                else:
                    backend.clear()
            except InvalidCacheBackendError:
                self.stderr.write('Cache "%s" is invalid!\n' % key)
            else:
                self.stdout.write('Cache "%s" has been cleared!\n' % key)
