{{ config(materialized='table') }}

SELECT
    *,
    32620 AS srid_source
FROM {{ ref('consommation_guadeloupe') }}
UNION ALL
SELECT
    *,
    32620 AS srid_source
FROM {{ ref('consommation_martinique') }}
UNION ALL
SELECT
    *,
    2972 AS srid_source
FROM {{ ref('consommation_guyane') }}
UNION ALL
SELECT
    *,
    2975 AS srid_source
FROM {{ ref('consommation_reunion') }}
UNION ALL
SELECT
    *,
    2154 AS srid_source
FROM {{ ref('consommation_metropole') }}
