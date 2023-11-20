import logging
from functools import wraps


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
