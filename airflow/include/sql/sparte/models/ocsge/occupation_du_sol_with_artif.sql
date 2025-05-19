{{ config(materialized="view") }}

select
    occupation_du_sol.id,
    occupation_du_sol.loaded_date,
    occupation_du_sol.code_cs,
    occupation_du_sol.code_us,
    occupation_du_sol.departement,
    occupation_du_sol.year,
    millesimes.index,
    artif.is_artificial,
    artif.critere_seuil,
    occupation_du_sol.is_impermeable,
    occupation_du_sol.uuid,
    occupation_du_sol.geom,
    occupation_du_sol.srid_source,
    occupation_du_sol.surface
from
    {{ ref('occupation_du_sol') }}
LEFT JOIN
    {{ ref('millesimes') }}
ON
    occupation_du_sol.year = millesimes.year and
    occupation_du_sol.departement = millesimes.departement
,
LATERAL (
    SELECT
        is_artificial,
        critere_seuil
    FROM {{ ref('artif') }}
        WHERE
            occupation_du_sol.id = artif.id and
            occupation_du_sol.year = artif.year and
            occupation_du_sol.departement = artif.departement
        limit 1
) as artif
