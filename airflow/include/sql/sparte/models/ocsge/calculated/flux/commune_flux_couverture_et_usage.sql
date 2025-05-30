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
            round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface,
            cs_old,
            cs_new,
            us_old,
            us_new,
            new_is_impermeable,
            new_not_impermeable
        from {{ ref("difference_commune") }}
        group by
            commune_code,
            commune_surface,
            year_new,
            year_old,
            cs_old,
            cs_new,
            us_old,
            us_new,
            new_is_impermeable,
            new_not_impermeable
    )
select
    without_percent.*,
    surface / commune_surface * 100 as percent

FROm without_percent
