from django_docx_template import data_sources

# let's imagine you have a Model Person
from .models import Project


class DiagnosticSource(data_sources.DataSource):
    # properties
    label = "Données pour publier un rapport de diagnostic"
    model = Project
    url_args = {"pk": "int"}

    # fields that will be used for merging
    name = data_sources.Field()
    description = data_sources.Field()
    analyse_start_date = data_sources.Field()
    analyse_end_date = data_sources.Field()
    first_year_ocsge = data_sources.Field()
    last_year_ocsge = data_sources.Field()
