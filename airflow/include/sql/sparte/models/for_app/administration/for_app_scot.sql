{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

with autorisation_logement_summary as (
    SELECT DISTINCT land_id
    FROM {{ ref('for_app_autorisationlogement') }}
    WHERE land_type = '{{ var('SCOT') }}'
), logement_vacants_summary as (
    SELECT DISTINCT land_id
    FROM {{ ref('for_app_logementvacant') }}
    WHERE land_type = '{{ var('SCOT') }}'
)
SELECT
    scot.epci_porteur_siren as siren,
    scot.id_scot as source_id,
    scot.nom_scot as name,
    ST_Transform(scot.geom, 4326) as mpoly,
    scot.srid_source as srid_source,
    scot.id_scot in (
        SELECT land_id
        FROM autorisation_logement_summary
    ) as autorisation_logement_available,
    scot.id_scot in (
        SELECT land_id
        FROM logement_vacants_summary
    ) as logements_vacants_available
FROM
    {{ ref('scot') }} as scot
WHERE geom IS NOT NULL
