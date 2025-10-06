{% macro merge_imper_commune_flux_by_sol(sol) %}


{% set code_sol_old = "cs_old" if sol == 'couverture' else "us_old" %}
{% set code_sol_new = "cs_new" if sol == 'couverture' else "us_new" %}


with
    imper as (
        select
            commune_code,
            commune_surface,
            year_old,
            year_new,
            year_old_index,
            year_new_index,
            {{ code_sol_new }} as {{ sol }},
            sum(surface) as surface_imper,
            departement
        from {{ ref("commune_flux_couverture_et_usage") }}
        where new_is_impermeable
        group by
            departement,
            commune_code,
            commune_surface,
            year_old,
            year_new,
            year_old_index,
            year_new_index,
            new_is_impermeable,
            {{ code_sol_new }}
    ),
    desimper as (
        select
            commune_code,
            commune_surface,
            year_old,
            year_new,
            year_old_index,
            year_new_index,
            {{ code_sol_old }} as {{ sol }},
            sum(surface) as surface_desimper,
            departement
        from {{ ref("commune_flux_couverture_et_usage") }}
        where new_not_impermeable
        group by
            departement,
            commune_code,
            commune_surface,
            year_old,
            year_new,
            year_old_index,
            year_new_index,
            new_is_impermeable,
            {{ code_sol_old }}
    )
select
    coalesce(imper.commune_code, desimper.commune_code) as commune_code,
    coalesce(imper.commune_surface, desimper.commune_surface) as commune_surface,
    coalesce(imper.year_old, desimper.year_old) as year_old,
    coalesce(imper.year_new, desimper.year_new) as year_new,
    coalesce(imper.year_old_index, desimper.year_old_index) as year_old_index,
    coalesce(imper.year_new_index, desimper.year_new_index) as year_new_index,
    coalesce(imper.{{ sol }}, desimper.{{ sol }}) as {{ sol }},
    coalesce(imper.surface_imper, 0) as flux_imper,
    coalesce(desimper.surface_desimper, 0) as flux_desimper,
    coalesce(imper.surface_imper, 0) - coalesce(desimper.surface_desimper, 0) as flux_imper_net,
    coalesce(imper.departement, desimper.departement) as departement
from imper
full outer join
    desimper
    on imper.commune_code = desimper.commune_code
    and imper.{{ sol }} = desimper.{{ sol }}
    and imper.year_old = desimper.year_old
    and imper.year_new = desimper.year_new

{% endmacro %}
