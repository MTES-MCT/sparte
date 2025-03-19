{{ config(materialized="view") }}

select
    occupation_du_sol.id,
    occupation_du_sol.loaded_date,
    occupation_du_sol.code_cs,
    occupation_du_sol.code_us,
    occupation_du_sol.departement,
    occupation_du_sol.year,
    occupation_du_sol.is_impermeable,
    occupation_du_sol.uuid,
    occupation_du_sol.geom,
    occupation_du_sol.srid_source,
    occupation_du_sol.surface,
    case
        when artif.is_artificial is null
        then false
        else true
    end as official_artif,
    case
        when artif.is_artificial is null
        then occupation_du_sol.is_artificial
        else artif.is_artificial
    end as is_artificial,
    case
        when artif.critere_seuil is null
        then false
        else artif.critere_seuil
    end as critere_seuil
from
    {{ ref('occupation_du_sol') }},
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
