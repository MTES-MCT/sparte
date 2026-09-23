{% macro set_empty_data(commune_code, start_year=2011, end_year=2025, source_commune_code='76676') %}
{#
    Emits a zero-consumption row for `commune_code` (a commune missing from the
    MAJIC source). It reuses divide_majic with percent=0: every conso column of
    `source_commune_code` is multiplied by 0, so the values are empty while the
    column layout and geometry (from `commune`) stay consistent with the union.
#}
{{ divide_majic(source_commune_code, commune_code, percent=0, start_year=start_year, end_year=end_year) }}
{% endmacro %}
