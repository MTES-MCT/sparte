{% macro merge_artif_commune_by_sol(sol) %}


{% set code_sol = "code_cs" if sol == 'couverture' else "code_us" %}

with
    without_percent as (
        select
            commune_code as code,
            year,
            sum(percent) as percent_of_land,
            sum(surface) as artificial_surface,
            commune_couverture_et_usage.departement,
            index,
            {{ code_sol }} as {{ sol }}
        from {{ ref("commune_couverture_et_usage") }}
        where is_artificial
        group by commune_code, year, {{ code_sol }}, departement, index
    )
select
    without_percent.*,
    (without_percent.artificial_surface / artif_commune.artificial_surface) * 100 as percent_of_artif
from without_percent
left join
    {{ ref("artif_commune") }}
    on without_percent.code = artif_commune.code
    and without_percent.year = artif_commune.year
    and without_percent.departement = artif_commune.departement

{% endmacro %}
