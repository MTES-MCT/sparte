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
            is_impermeable,
            index
        from {{ ref("occupation_du_sol_zonage_urbanisme") }}
        group by
            zonage_checksum,
            zonage_surface,
            zonage_libelle,
            zonage_type,
            year,
            index,
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
    index,
    surface,
    code_cs,
    code_us,
    case
        when zonage_surface = 0 then 0 else surface / zonage_surface * 100
    end as percent,
    is_artificial,
    is_impermeable
from without_percent
order by percent desc
