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
            is_impermeable
        from {{ ref("occupation_du_sol_commune") }}
        group by
            commune_code,
            commune_surface,
            year,
            code_cs,
            code_us,
            is_artificial,
            is_impermeable
    )
select
    commune_code,
    year,
    surface,
    code_cs,
    code_us,
    case
        when commune_surface = 0 then 0 else surface / commune_surface * 100
    end as percent,
    is_artificial,
    is_impermeable
from without_percent
order by percent desc
