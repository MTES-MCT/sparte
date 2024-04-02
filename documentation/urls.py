from django.urls import path

from . import views

app_name = "documentation"


urlpatterns = [
    path("tutoriel", views.TutorielView.as_view(), name="tutoriel"),
]
