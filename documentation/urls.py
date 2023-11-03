from django.urls import path
from rest_framework import routers

from . import views

app_name = "documentation"


urlpatterns = [
    path("faq", views.FAQView.as_view(), name="faq"),
]

router = routers.DefaultRouter()
urlpatterns += router.urls
