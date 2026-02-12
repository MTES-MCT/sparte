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
            code_us
        from {{ ref("occupation_du_sol_commune") }}
        group by
            commune_code,
            commune_surface,
            year,
            code_us
    )
select
    commune_code,
    year,
    surface,
    code_us,
    case
        when commune_surface = 0 then 0 else surface / commune_surface * 100
    end as percent
from without_percent
order by percent desc
