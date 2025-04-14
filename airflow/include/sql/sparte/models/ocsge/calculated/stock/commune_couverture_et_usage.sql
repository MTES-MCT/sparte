{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}

with
    without_percent as (
        select
            commune_code,
            commune_surface,
            year,
            round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface,
            code_cs,
            code_us,
            is_artificial,
            index,
            departement,
            is_impermeable
        from {{ ref("occupation_du_sol_commune") }}
        group by
            commune_code,
            commune_surface,
            year,
            departement,
            index,
            code_cs,
            code_us,
            is_artificial,
            is_impermeable
    )
select
    commune_code,
    departement,
    year,
    index,
    surface,
    code_cs,
    code_us,
    surface * 100.0 / commune_surface as percent,
    is_artificial,
    is_impermeable
from without_percent
order by percent desc
