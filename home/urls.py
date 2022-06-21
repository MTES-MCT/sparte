from django.urls import path

from . import views


app_name = "home"


urlpatterns = [
    path("", views.Home.as_view(), name="home"),
    path(
        "faq/<slug:slug>/",
        views.FrequentlyAskedQuestionDetail.as_view(),
        name="faq-detail",
    ),
    path("cgu", views.LegalNotice.as_view(), name="cgv"),
    path("confidentialité", views.Privacy.as_view(), name="privacy"),
    path("stats", views.Stats.as_view(), name="stats"),
]
