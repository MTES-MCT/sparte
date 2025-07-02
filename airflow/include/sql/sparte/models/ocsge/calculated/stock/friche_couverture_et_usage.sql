{{
    config(
        materialized="table",
        indexes=[{"columns": ["friche_site_id"], "type": "btree"}],
    )
}}

with
    without_percent as (
        select
            friche_site_id,
            friche_surface,
            year,
            round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface,
            code_cs,
            code_us,
            is_artificial,
            index,
            departement,
            is_impermeable
        from {{ ref("occupation_du_sol_friche") }}
        group by
            friche_site_id,
            friche_surface,
            year,
            departement,
            index,
            code_cs,
            code_us,
            is_artificial,
            is_impermeable
    )
select
    friche_site_id,
    departement,
    year,
    index,
    surface,
    code_cs,
    code_us,
    surface * 100.0 / friche_surface as percent,
    is_artificial,
    is_impermeable
from without_percent
order by percent desc
