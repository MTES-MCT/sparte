{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["year"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
        ],
    )
}}

with
    artif_year as (select distinct year, departement from {{ ref("artif") }}),
    occupation_du_sol_year as (
        select distinct year, departement from {{ ref("occupation_du_sol") }}
    ),
    diff_years as (
        select distinct year_new, year_old, departement from {{ ref("difference") }}
    )
select year, departement
from artif_year as a
where
    exists (
        select 1
        from occupation_du_sol_year as o
        where o.year = a.year and a.departement = o.departement
    )
    and exists (
        select 1
        from diff_years as d
        where
            d.departement = a.departement and d.year_old = a.year or d.year_new = a.year
    )
