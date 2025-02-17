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
            year,
            round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface,
            code_us
        from {{ ref("occupation_du_sol_zonage_urbanisme") }}
        group by zonage_checksum, zonage_surface, zonage_libelle, code_us, year
    )
select
    zonage_checksum,
    zonage_surface,
    zonage_libelle,
    year,
    surface,
    code_us,
    case
        when zonage_surface = 0 then 0 else surface / zonage_surface * 100
    end as percent
from without_percent
