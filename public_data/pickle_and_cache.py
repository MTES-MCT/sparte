import pickle

from django.core.cache import cache

from config.utils import version_as_int


def pickle_and_cache(key, data):
    """
    Pickle and cache data in redis
    """
    pickled_data = pickle.dumps(data)
    cache.set(
        key=key,
        value=pickled_data,
        version=version_as_int(),
    )


def get_from_cache_and_unpickle(key):
    """
    Get data from cache and unpickle it
    """
    pickled_data = cache.get(key)
    return pickle.loads(pickled_data) if pickled_data else None
