from django.urls import path

from . import views

app_name = "docx_template"


urlpatterns = [
    path("", views.TemplateListView.as_view(), name="base_url"),
    path("templates", views.TemplateListView.as_view(), name="list"),
    path("templates/detail/<slug>", views.TemplateDetailView.as_view(), name="detail"),
    path("templates/create", views.TemplateCreateView.as_view(), name="create"),
    path("templates/update/<slug>", views.TemplateUpdateView.as_view(), name="update"),
    path("templates/delete/<slug>", views.TemplateDeletelView.as_view(), name="delete"),
    path(
        "templates/example/<slug>",
        views.TemplateExampleMergeView.as_view(),
        name="merge-example",
    ),
    path(
        "templates/example/<slug>/<int:example_number>",
        views.TemplateExampleMergeView.as_view(),
        name="merge-example",
    ),
    path("sources", views.DataSourceListView.as_view(), name="data_source_list"),
    path(
        "sources/detail/<slug>",
        views.DataSourceDetailView.as_view(),
        name="data_source",
    ),
]
