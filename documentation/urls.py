from django.urls import path

from . import views

app_name = "documentation"


urlpatterns = [
    path("faq", views.FAQView.as_view(), name="faq"),
    path("tutoriel", views.TutorielView.as_view(), name="tutoriel"),
]
