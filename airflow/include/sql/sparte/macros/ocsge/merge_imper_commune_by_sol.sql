{% macro merge_imper_commune_by_sol(sol) %}


{% set code_sol = "code_cs" if sol == 'couverture' else "code_us" %}

with
    without_percent as (
        select
            commune_code,
            year,
            sum(percent) as percent_of_commune,
            sum(surface) as surface,
            {{ code_sol }} as {{ sol }}
        from {{ ref("commune_couverture_et_usage") }}
        where is_impermeable
        group by commune_code, year, {{ code_sol }}
    )
select
    without_percent.*,
    (without_percent.surface / imper_commune.surface) * 100 as percent_of_imper
from without_percent
left join
    {{ ref("imper_commune") }}
    on without_percent.commune_code = imper_commune.commune_code
    and without_percent.year = imper_commune.year

{% endmacro %}
