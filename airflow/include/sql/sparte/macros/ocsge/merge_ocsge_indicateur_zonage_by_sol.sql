{% macro merge_ocsge_indicateur_zonage_by_sol(indicateur_zonage_table, where_conditions, sol) %}


{% set code_sol = "code_cs" if sol == 'couverture' else "code_us" %}

with
    without_percent as (
        select
            zonage_checksum,
            year,
            sum(percent) as percent_of_zonage,
            sum(surface) as surface,
            index,
            {{ code_sol }} as {{ sol }}
        from {{ ref("zonage_couverture_et_usage") }}
        {% if where_conditions %}
            WHERE
        {% for condition in where_conditions %}
            {{ condition }}
            {% if not loop.last %} AND {% endif %}
        {% endfor %}
        {% else %}
        {% endif %}
        group by zonage_checksum, year, {{ code_sol }}, index
    )
select
    without_percent.*,
    CASE {{ indicateur_zonage_table }}.surface
        when 0 then 0
        else (without_percent.surface / {{ indicateur_zonage_table }}.surface) * 100
    end as percent_of_indicateur
from without_percent
left join
    {{ ref(indicateur_zonage_table) }}
    on without_percent.zonage_checksum = {{ indicateur_zonage_table }}.zonage_checksum
    and without_percent.year = {{ indicateur_zonage_table }}.year

{% endmacro %}
