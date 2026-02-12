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
            departement,
            year_old,
            year_new,
            year_old_index,
            year_new_index,
            round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface,
            cs_new,
            us_new,
            new_is_artificial,
            new_not_artificial
        from {{ ref("artif_difference_zonage_urbanisme") }}
        group by
            zonage_checksum,
            zonage_surface,
            departement,
            year_new,
            year_old,
            year_old_index,
            year_new_index,
            cs_new,
            us_new,
            new_is_artificial,
            new_not_artificial
    )
select
    without_percent.*,
    surface / zonage_surface * 100 as percent
from without_percent
