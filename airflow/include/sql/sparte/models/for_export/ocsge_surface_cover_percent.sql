{{ config(materialized="table") }}

{% set surface_france = 543940.0 %} /* km2 */


with latest_millesimes_marked as (
    SELECT
        departement,
        index,
        row_number() over (partition by
            departement
            order by index desc
        ) as rn

    from {{ ref('millesimes') }}
), surface_by_departements as (
SELECT
    latest_millesimes_marked.departement,
    departement.surface / 1000000.0 as surface
FROM
    latest_millesimes_marked
LEFT JOIN
    {{ ref('departement')}} ON latest_millesimes_marked.departement = departement.code
WHERE rn = 1
)
SELECT
    round(sum(surface)::numeric, 2) as surface_couverte_par_ocsge,
    {{ surface_france }}::numeric as surface_france,
    round((sum(surface) / {{ surface_france }} * 100.0)::numeric, 2) as pourcentage_couvert_par_ocsge
FROM
    surface_by_departements
