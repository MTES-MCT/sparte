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
    )
select
    year,
    departement,
    row_number() over (partition by departement order by year) as index
from artif_year as a
where
    exists (
        select 1
        from occupation_du_sol_year as o
        where o.year = a.year and a.departement = o.departement
    )
