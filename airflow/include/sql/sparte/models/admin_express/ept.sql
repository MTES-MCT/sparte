{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['id'], 'type': 'btree'},
            {'columns': ['code'], 'type': 'btree'},
            {'columns': ['name'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ])
}}
with together as (
    SELECT
        *,
        32620 AS srid_source
    FROM {{ ref('epci_guadeloupe') }}
    UNION ALL
    SELECT
        *,
        32620 AS srid_source
    FROM {{ ref('epci_martinique') }}
    UNION ALL
    SELECT
        *,
        2972 AS srid_source
    FROM {{ ref('epci_guyane') }}
    UNION ALL
    SELECT
        *,
        2975 AS srid_source
    FROM {{ ref('epci_reunion') }}
    UNION ALL
    SELECT
        *,
        2154 AS srid_source
    FROM {{ ref('epci_metropole') }}
)
SELECT * FROM together
WHERE is_ept = true
