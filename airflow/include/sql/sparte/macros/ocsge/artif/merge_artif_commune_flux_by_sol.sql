{% macro merge_artif_commune_flux_by_sol(sol) %}


{% set code_sol_old = "cs_old" if sol == 'couverture' else "us_old" %}
{% set code_sol_new = "cs_new" if sol == 'couverture' else "us_new" %}


with
    artif as (
        select
            commune_code,
            commune_surface,
            year_old,
            year_new,
            year_old_index,
            year_new_index,
            {{ code_sol_new }} as {{ sol }},
            sum(surface) as surface_artif,
            departement
        from {{ ref("commune_flux_couverture_et_usage_artif") }}
        where new_is_artificial
        group by
            departement,
            commune_code,
            commune_surface,
            year_old,
            year_new,
            year_old_index,
            year_new_index,
            new_is_artificial,
            {{ code_sol_new }}
    ),
    desartif as (
        select
            commune_code,
            commune_surface,
            year_old,
            year_new,
            year_old_index,
            year_new_index,
            {{ code_sol_old }} as {{ sol }},
            sum(surface) as surface_desartif,
            departement
        from {{ ref("commune_flux_couverture_et_usage_artif") }}
        where new_not_artificial
        group by
            departement,
            commune_code,
            commune_surface,
            year_old,
            year_new,
            year_old_index,
            year_new_index,
            new_is_artificial,
            {{ code_sol_old }}
    )
select
    coalesce(artif.commune_code, desartif.commune_code) as commune_code,
    coalesce(artif.commune_surface, desartif.commune_surface) as commune_surface,
    coalesce(artif.year_old, desartif.year_old) as year_old,
    coalesce(artif.year_new, desartif.year_new) as year_new,
    coalesce(artif.year_old_index, desartif.year_old_index) as year_old_index,
    coalesce(artif.year_new_index, desartif.year_new_index) as year_new_index,
    coalesce(artif.{{ sol }}, desartif.{{ sol }}) as {{ sol }},
    coalesce(artif.surface_artif, 0) as flux_artif,
    coalesce(desartif.surface_desartif, 0) as flux_desartif,
    coalesce(artif.surface_artif, 0) - coalesce(desartif.surface_desartif, 0) as flux_artif_net,
    coalesce(artif.departement, desartif.departement) as departement
from artif
full outer join
    desartif
    on artif.commune_code = desartif.commune_code
    and artif.{{ sol }} = desartif.{{ sol }}
    and artif.year_old = desartif.year_old
    and artif.year_new = desartif.year_new

{% endmacro %}
