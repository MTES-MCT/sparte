{{
    config(
        materialized="table",
        indexes=[{"columns": ["zonage_checksum"], "type": "btree"}],
    )
}}

with
    without_percent as (
        select
            zonage_checksum,
            zonage_surface,
            zonage_libelle,
            zonage_type,
            year,
            round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface,
            code_cs,
            code_us,
            is_artificial,
            is_impermeable
        from {{ ref("occupation_du_sol_zonage_urbanisme") }}
        group by
            zonage_checksum,
            zonage_surface,
            zonage_libelle,
            zonage_type,
            year,
            code_cs,
            code_us,
            is_artificial,
            is_impermeable
    )
select
    zonage_checksum,
    zonage_surface,
    zonage_libelle,
    zonage_type,
    year,
    surface,
    code_cs,
    code_us,
    surface / zonage_surface * 100 as percent,
    is_artificial,
    is_impermeable
from without_percent
order by percent desc
