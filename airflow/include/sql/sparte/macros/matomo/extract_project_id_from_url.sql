{% macro extract_project_id_from_url(url_field) %}
-- in sql
-- format looks like : mondiagnosticartificialisation.beta.gouv.fr/project/36332/
    (regexp_matches(
    {{ url_field}},
    '/project/([0-9]+)/'
    ))[1]::int

{% endmacro %}
