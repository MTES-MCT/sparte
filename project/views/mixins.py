"""Mixins available for all views."""


class UserQuerysetOnlyMixin:
    """Filter queryset to return only connected user objects."""

    def get_queryset(self):
        # get queryset from class queryset var
        qs = self.queryset
        # apply filter on user owned project only
        user = self.request.user
        qs = qs.filter(user=user)
        return qs


class GetObjectMixin:
    """override get_object to cache returned object."""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.object = None

    def get_object(self, queryset=None):
        if not self.object:
            self.object = super().get_object(queryset)
        return self.object
