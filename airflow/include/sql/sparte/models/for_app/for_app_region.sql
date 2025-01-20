{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}
with autorisation_logement_summary as (
    SELECT DISTINCT land_id
    FROM {{ ref('for_app_autorisationlogement') }}
    WHERE land_type = '{{ var('REGION') }}'
), logement_vacants_summary as (
    SELECT DISTINCT land_id
    FROM {{ ref('for_app_logementvacant') }}
    WHERE land_type = '{{ var('REGION') }}'
)
SELECT
    code AS source_id,
    name AS name,
    code in (
        SELECT land_id
        FROM autorisation_logement_summary
    ) as autorisation_logement_available,
    code in (
        SELECT land_id
        FROM logement_vacants_summary
    ) as logements_vacants_available,
    srid_source AS srid_source,
    ST_Transform(geom, 4326) AS mpoly
FROM
    {{ ref('region') }}
