"""Mixins available for all views."""


class UserQuerysetOnlyMixin:
    """Filter queryset to return only connected user objects."""

    def get_queryset(self):
        # get queryset from class queryset var
        qs = self.queryset
        # apply filter on user owned project only
        user = self.request.user
        if user.is_authenticated:
            qs = qs.filter(user=user)
        else:
            qs = qs.none()
        return qs


class UserQuerysetOrPublicMixin(UserQuerysetOnlyMixin):
    """Filter project to return all user's project or public ones."""

    def get_queryset(self):
        # get queryset from class queryset var
        qs = super().get_queryset()
        qs |= self.queryset.filter(is_public=True)
        return qs
