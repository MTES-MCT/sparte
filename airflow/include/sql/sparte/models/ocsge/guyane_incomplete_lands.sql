{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["land_id", "land_type"], "type": "btree"},
        ],
    )
}}

/*
Sélectionne les lands de Guyane dont la géométrie N'EST PAS entièrement
couverte par les données artif ET occupation_du_sol pour au moins une année.
*/

with ocsge_years as (
    select year from {{ ref('millesimes') }}
    where departement = '973'
),
artif_coverage_by_year as (
    select
        year,
        ST_Union(geom) as coverage
    from {{ ref('artif') }}
    where departement = '973'
    group by year
),
occupation_coverage_by_year as (
    select
        year,
        ST_Union(geom) as coverage
    from {{ ref('occupation_du_sol') }}
    where departement = '973'
    group by year
),
lands_guyane as (
    select
        land_id,
        land_type,
        geom
    from {{ ref('land') }}
    where '973' = ANY(departements)  -- pour EPCI, SCOT, REGION
       OR departements = string_to_array('973', '')  -- pour COMMUNE, DEPARTEMENT (string_to_array split chaque caractère)
),
nb_years as (
    select count(*) as total from ocsge_years
),
lands_covered_per_year as (
    select
        l.land_id,
        l.land_type,
        y.year
    from lands_guyane l
    cross join ocsge_years y
    inner join artif_coverage_by_year a on a.year = y.year
    inner join occupation_coverage_by_year o on o.year = y.year
    where ST_CoveredBy(l.geom, a.coverage)
      and ST_CoveredBy(l.geom, o.coverage)
)
select
    l.land_id,
    l.land_type
from lands_guyane l
left join lands_covered_per_year c
    on l.land_id = c.land_id and l.land_type = c.land_type
group by l.land_id, l.land_type
having coalesce(count(c.year), 0) < (select total from nb_years)
