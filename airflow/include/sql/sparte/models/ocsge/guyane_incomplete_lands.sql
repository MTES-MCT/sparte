{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["land_id", "land_type"], "type": "btree"},
        ],
    )
}}

/*
Sélectionne les lands de Guyane dont l'extent N'EST PAS entièrement
contenu dans l'extent de artif ET occupation_du_sol pour au moins une année.
*/

with ocsge_years as (
    select year from {{ ref('millesimes') }}
    where departement = '973'
),
artif_extent_by_year as (
    select
        year,
        st_extent(geom)::geometry as extent
    from {{ ref('artif') }}
    where departement = '973'
    group by year
),
occupation_extent_by_year as (
    select
        year,
        st_extent(geom)::geometry as extent
    from {{ ref('occupation_du_sol') }}
    where departement = '973'
    group by year
),
lands_guyane as (
    select
        land_id,
        land_type,
        st_extent(geom)::geometry as extent
    from {{ ref('land') }}
    where departements = ARRAY['973']
    group by land_id, land_type
),
nb_years as (
    select count(*) as total from ocsge_years
),
lands_covered_per_year as (
    select
        l.land_id,
        l.land_type,
        l.extent,
        y.year
    from lands_guyane l
    cross join ocsge_years y
    inner join artif_extent_by_year a on a.year = y.year
    inner join occupation_extent_by_year o on o.year = y.year
    where l.extent @ a.extent
      and l.extent @ o.extent
)
select
    l.land_id,
    l.land_type
from lands_guyane l
left join lands_covered_per_year c
    on l.land_id = c.land_id and l.land_type = c.land_type
group by l.land_id, l.land_type
having coalesce(count(c.year), 0) < (select total from nb_years)
