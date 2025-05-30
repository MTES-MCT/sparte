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
            us_old,
            us_new
        from {{ ref("difference_commune") }}
        WHERE
            us_old != us_new
        group by
            commune_code,
            commune_surface,
            year_new,
            year_old,
            us_old,
            us_new
    )
select
    without_percent.*,
    surface / commune_surface * 100 as percent

FROm without_percent
