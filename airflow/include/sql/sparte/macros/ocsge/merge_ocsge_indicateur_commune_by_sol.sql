{% macro merge_ocsge_indicateur_commune_by_sol(indicateur_commune_table, where_conditions, sol) %}


{% set code_sol = "code_cs" if sol == 'couverture' else "code_us" %}

with
    without_percent as (
        select
            commune_code as code,
            year,
            sum(percent) as percent_of_land,
            sum(surface) as surface,
            commune_couverture_et_usage.departement,
            index,
            {{ code_sol }} as {{ sol }}
        from {{ ref("commune_couverture_et_usage") }}
        {% if where_conditions %}
            WHERE
        {% for condition in where_conditions %}
            {{ condition }}
            {% if not loop.last %} AND {% endif %}
        {% endfor %}
        {% else %}
        {% endif %}
        group by commune_code, year, {{ code_sol }}, departement, index
    )
select
    without_percent.*,
    (without_percent.surface / {{ indicateur_commune_table }}.surface) * 100 as percent_of_indicateur
from without_percent
left join
    {{ ref(indicateur_commune_table) }}
    on without_percent.code = {{ indicateur_commune_table }}.code
    and without_percent.year = {{ indicateur_commune_table }}.year
    and without_percent.departement = {{ indicateur_commune_table }}.departement

{% endmacro %}
