import logging
from functools import wraps
from inspect import isclass

from django.core.cache import cache


def log_function(logger: logging.Logger):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            logger.info(f"Start {func.__name__}; args={args}; kwargs={kwargs}")
            try:
                result = func(*args, **kwargs)
            except:  # noqa: B001, E722
                logger.warning(f"Uncatched exception in {func.__name__}")
                raise
            finally:
                print(f"End {func.__name__}; args={args}; kwargs={kwargs}")
            return result

        return wrapper

    return decorator


def _get_cache_key_class_or_instance(self_or_cls, func, suffix_cache_key_lambda, kwargs):
    class_name = self_or_cls.__class__.__name__
    method_name = func.__name__
    cache_key = f"{class_name}/{method_name}"

    if suffix_cache_key_lambda:
        cache_key += f"/{suffix_cache_key_lambda(self_or_cls, kwargs)}"
    else:
        # list of arguments as string, except the first one (self or cls)
        kwargs_as_string = ";".join([f"{key}={value}" for key, value in kwargs.items()])
        cache_key += f"/{kwargs_as_string}"

    return cache_key


def _get_cache_key_function(func, kwargs):
    func_module = func.__module__
    func_name = func.__name__
    kwargs_as_string = ";".join([f"{key}={value}" for key, value in kwargs.items()])

    cache_key = f"{func_module}/{func_name}/{kwargs_as_string}"

    return cache_key


def cache_method(suffix_cache_key_lambda=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            has_first_arg = len(args) > 0

            is_self = has_first_arg and hasattr(args[0], "__dict__")
            is_cls = has_first_arg and isclass(object=args[0])

            if is_self or is_cls:
                has_more_than_one_arg = len(args) > 1
                if has_more_than_one_arg:
                    raise Exception("The cache_method only works with kwargs")

                cache_key = _get_cache_key_class_or_instance(
                    self_or_cls=args[0], suffix_cache_key_lambda=suffix_cache_key_lambda, func=func, kwargs=kwargs
                )
            else:
                if args:
                    raise Exception("The cache_method only works with kwargs")

                cache_key = _get_cache_key_function(func=func, kwargs=kwargs)

            if cache.has_key(cache_key):
                return cache.get(cache_key)

            result = func(*args, **kwargs)
            cache.set(cache_key, result)

            return result

        return wrapper

    return decorator
