from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import BooleanField, Case, Count, OuterRef, Subquery, Value, When
from django.db.models.functions import Coalesce
from django.shortcuts import redirect
from django.views import View
from django.views.generic import ListView

from project.models.report_draft import ReportDraft
from project.models.user_land_preference import UserLandPreference


class UserLandPreferenceListView(LoginRequiredMixin, ListView):
    template_name = "project/pages/list.html"
    context_object_name = "preferences"
    paginate_by = 10

    def get_queryset(self):
        user = self.request.user
        report_count_subquery = (
            ReportDraft.objects.filter(
                land_type=OuterRef("land_type"),
                land_id=OuterRef("land_id"),
                user=user,
            )
            .order_by()
            .values("land_type", "land_id")
            .annotate(cnt=Count("id"))
            .values("cnt")
        )
        return (
            UserLandPreference.objects.filter(user=user)
            .annotate(
                report_count=Coalesce(Subquery(report_count_subquery), 0),
                is_favorite=Case(
                    When(
                        land_type=user.main_land_type,
                        land_id=user.main_land_id,
                        then=Value(True),
                    ),
                    default=Value(False),
                    output_field=BooleanField(),
                ),
            )
            .order_by("-is_favorite", "-id")
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from public_data.models import LandModel

        for pref in context["preferences"]:
            try:
                pref.land = LandModel.objects.get(land_type=pref.land_type, land_id=pref.land_id)
            except LandModel.DoesNotExist:
                pref.land = None

        # Find the favorite pref (main_land) among the already-enriched preferences
        context["main_pref"] = next((p for p in context["preferences"] if p.is_favorite and p.land), None)
        context["has_other_favorites"] = any(p for p in context["preferences"] if not p.is_favorite and p.land)

        return context


class RemoveFavoriteView(LoginRequiredMixin, View):
    def post(self, request, pk):
        UserLandPreference.objects.filter(pk=pk, user=request.user).delete()
        return redirect("project:list")
