{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}
with autorisation_logement_summary as (
    SELECT DISTINCT land_id
    FROM {{ ref('for_app_autorisationlogement') }}
    WHERE land_type = '{{ var('DEPARTEMENT') }}'
), logement_vacants_summary as (
    SELECT DISTINCT land_id
    FROM {{ ref('for_app_logementvacant') }}
    WHERE land_type = '{{ var('DEPARTEMENT') }}'
), millesimes as (
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
    case
        when millesimes.ocsge_millesimes is NULL then FALSE
        when ARRAY_LENGTH(millesimes.ocsge_millesimes, 1) = 1 then FALSE
        else TRUE
    end                                  as is_artif_ready,
    code in (
        SELECT land_id
        FROM autorisation_logement_summary
    ) as autorisation_logement_available,
    code in (
        SELECT land_id
        FROM logement_vacants_summary
    ) as logements_vacants_available,
    departement.srid_source,
    ST_TRANSFORM(departement.geom, 4326) as mpoly
from
    {{ ref('departement') }} as departement
left join
    millesimes
    on
        departement.code = millesimes.departement
