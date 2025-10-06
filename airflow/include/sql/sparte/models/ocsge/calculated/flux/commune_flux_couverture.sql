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
            year_old,
            year_new,
            year_old_index,
            year_new_index,
            round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface,
            cs_old,
            cs_new,
            departement
        from {{ ref("difference_commune") }}
        WHERE
            cs_old != cs_new
        group by
            commune_code,
            commune_surface,
            year_new,
            year_old,
            year_old_index,
            year_new_index,
            departement,
            cs_old,
            cs_new
    )
select
    without_percent.*,
    surface / commune_surface * 100 as percent

FROm without_percent
