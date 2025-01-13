{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}
with autorisation_logement_summary as (
    SELECT DISTINCT code_epci
    FROM {{ ref('logement_epci') }}
), logement_vacants_summary as (
    SELECT DISTINCT code_epci
    FROM {{ ref('logements_vacants_epci') }}
)
SELECT
    code                     AS source_id,
    name,
    srid_source,
    ST_TRANSFORM(geom, 4326) AS mpoly,
    code in (
        SELECT code_epci
        FROM autorisation_logement_summary
    ) as autorisation_logement_available,
    code in (
        SELECT code_epci
        FROM logement_vacants_summary
    ) as logements_vacants_available
FROM
    {{ ref('epci') }}
