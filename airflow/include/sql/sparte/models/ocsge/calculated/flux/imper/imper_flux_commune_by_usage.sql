{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}

with
    imper as (
        select
            commune_code,
            commune_surface,
            year_old,
            year_new,
            us_new as usage,
            sum(surface) as surface_imper
        from {{ ref("commune_flux_couverture_et_usage") }}
        where new_is_impermeable
        group by
            commune_code,
            commune_surface,
            year_old,
            year_new,
            new_is_impermeable,
            us_new
    ),
    desimper as (
        select
            commune_code,
            commune_surface,
            year_old,
            year_new,
            us_old as usage,
            sum(surface) as surface_desimper
        from {{ ref("commune_flux_couverture_et_usage") }}
        where new_not_impermeable
        group by
            commune_code,
            commune_surface,
            year_old,
            year_new,
            new_is_impermeable,
            us_old
    )
select
    coalesce(imper.commune_code, desimper.commune_code) as commune_code,
    coalesce(imper.commune_surface, desimper.commune_surface) as commune_surface,
    coalesce(imper.year_old, desimper.year_old) as year_old,
    coalesce(imper.year_new, desimper.year_new) as year_new,
    coalesce(imper.usage, desimper.usage) as usage,
    coalesce(imper.surface_imper, 0) as surface_imper,
    coalesce(desimper.surface_desimper, 0) as surface_desimper
from imper
full outer join
    desimper
    on imper.commune_code = desimper.commune_code
    and imper.usage = desimper.usage
    and imper.year_old = desimper.year_old
    and imper.year_new = desimper.year_new
