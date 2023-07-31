from django.urls import path
from django.views.generic import TemplateView


app_name = "metabase"


urlpatterns = [
    path("", TemplateView.as_view(template_name="metabase/stats.html"), name="stats"),
]
