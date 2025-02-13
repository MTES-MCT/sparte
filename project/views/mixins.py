"""Mixins available for all views."""

from django import forms
from django.contrib import messages
from django.db.models import Q
from django.shortcuts import redirect
from django.urls import reverse, reverse_lazy

from project.models import Project
from utils.views_mixins import BreadCrumbMixin, GetObjectMixin


class UserQuerysetOnlyMixin:
    """Filter queryset to return only connected user objects."""

    def get_queryset(self):
        # get queryset from class queryset var
        qs = super().get_queryset()
        # apply filter on user owned project only
        user = self.request.user
        if user.is_authenticated:
            return qs.filter(user=user)
        return qs.none()


class UserQuerysetOrPublicMixin:
    """Filter project to return all user's project or public ones."""

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            return qs.filter(Q(user=user) | Q(is_public=True))
        else:
            return qs.filter(is_public=True)


class GroupMixin(GetObjectMixin, UserQuerysetOrPublicMixin, BreadCrumbMixin):
    """Simple trick to not repeat myself. Pertinence to be evaluated."""

    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:list"), "title": "Mes diagnostics"},
        )
        try:
            project = self.get_object()
            breadcrumbs.append(
                {
                    "href": reverse_lazy("project:home", kwargs={"pk": project.id}),
                    "title": project.name,
                }
            )
        except AttributeError:
            pass
        return breadcrumbs


class OcsgeCoverageMixin:
    def dispatch(self, request, *args, **kwargs):
        project: Project = self.get_object()
        if project.ocsge_coverage_status != project.OcsgeCoverageStatus.COMPLETE_UNIFORM:
            message = self._build_error_message()
            messages.error(request, message)
            return redirect(reverse("project:report_synthesis", kwargs={"pk": project.pk}))
        return super().dispatch(request, *args, **kwargs)

    def _build_error_message(self):
        page_name = getattr(self, "breadcrumbs_title", "cette page")
        page_name_literal = "à la page " + page_name if page_name != "cette page" else page_name
        return f"Vous ne pouvez pas accéder {page_name_literal} car l'OCS GE n'est pas disponible pour ce territoire."


class ReactMixin:
    partial_template_name = ""
    full_template_name = ""

    def get_template_names(self):
        if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return [self.partial_template_name]
        return [self.full_template_name]


class PeriodValidationMixin:
    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get("analyse_start_date")
        end_date = cleaned_data.get("analyse_end_date")

        if start_date and end_date and start_date >= end_date:
            raise forms.ValidationError(
                {
                    "analyse_start_date": (
                        "L'année de début de période ne peut pas être supérieure ou égale à l'année de fin de période."
                    )
                }
            )
        return cleaned_data
