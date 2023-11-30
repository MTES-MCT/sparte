# test suite for decorators.py with pytest

import pytest
from django.core.cache import cache

from utils.decorators import (
    _get_cache_key_class_or_instance,
    _get_cache_key_function,
    cache_method,
)


class TestCacheMethod:
    def test_cached_function(self):
        @cache_method()
        def func(a, b):
            return a + b

        expected_cache_key = "utils.test_decorators/func/a=1;b=2"
        cache_key = _get_cache_key_function(func, kwargs={"a": "1", "b": "2"})

        assert cache_key == expected_cache_key
        assert func(a=1, b=2) == 3
        assert cache.get(expected_cache_key) == 3
        assert func(a=1, b=2) == 3
        with pytest.raises(expected_exception=Exception):
            func(1, 2)

    def test_cache_with_class_method_kwargs(self):
        class A:
            @cache_method()
            def func(self, a, b):
                return a + b

        a = A()
        expected_cache_key = "A/func/a=1;b=2"
        cache_key = _get_cache_key_class_or_instance(
            self_or_cls=a, suffix_cache_key_lambda=None, func=a.func, kwargs={"a": "1", "b": "2"}
        )
        assert cache_key == expected_cache_key
        assert a.func(a=1, b=2) == 3
        assert cache.get(expected_cache_key) == 3
        assert a.func(a=1, b=2) == 3

        with pytest.raises(expected_exception=Exception):
            a.func(1, 2)

    def test_cache_with_suffix_cache_key_lambda(self):
        def prop_getter(self, kwargs):
            return f"prop={self.prop};a={kwargs.get('a')};b={kwargs.get('b')}"

        class A:
            def __init__(self):
                self.prop = 0

            @cache_method(prop_getter)
            def func(self, a, b):
                return a + b

        a = A()

        expected_cache_key = "A/func/prop=0;a=1;b=2"
        cache_key = _get_cache_key_class_or_instance(
            self_or_cls=a, suffix_cache_key_lambda=prop_getter, func=a.func, kwargs={"a": "1", "b": "2"}
        )
        assert cache_key == expected_cache_key
        assert a.func(a=1, b=2) == 3
        assert cache.get(expected_cache_key) == 3
        assert a.func(a=1, b=2) == 3

        with pytest.raises(expected_exception=Exception):
            a.func(1, 2)
