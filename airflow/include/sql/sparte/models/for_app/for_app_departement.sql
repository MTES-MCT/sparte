{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

with millesimes as (
    select
        departement,
        ARRAY_AGG(distinct year) as ocsge_millesimes
    from
        {{ ref('occupation_du_sol') }}
    group by
        departement
)

select
    departement.code                     as source_id,
    departement.name,
    departement.region                   as region_id,
    millesimes.ocsge_millesimes,
    departement.srid_source,
    case
        when millesimes.ocsge_millesimes is NULL then FALSE
        when ARRAY_LENGTH(millesimes.ocsge_millesimes, 1) = 1 then FALSE
        else TRUE
    end                                  as is_artif_ready,
    ST_TRANSFORM(departement.geom, 4326) as mpoly,
    TRUE as autorisation_logement_available,
    TRUE as logements_vacants_available
from
    {{ ref('departement') }} as departement
left join
    millesimes
    on
        departement.code = millesimes.departement
