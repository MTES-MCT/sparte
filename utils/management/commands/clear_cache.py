from django.conf import settings
from django.core.cache import DEFAULT_CACHE_ALIAS, caches
from django.core.cache.backends.base import InvalidCacheBackendError
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """A simple management command which clears the site-wide cache."""

    help = 'Fully clear site-wide cache.'

    def handle(self, *args, **kwargs):
        cache = getattr(settings, 'CACHES', {DEFAULT_CACHE_ALIAS: {}}).keys()

        for key in cache:
            try:
                caches[key].clear()
            except InvalidCacheBackendError:
                self.stderr.write('Cache "%s" is invalid!\n' % key)
            else:
                self.stdout.write('Cache "%s" has been cleared!\n' % key)
