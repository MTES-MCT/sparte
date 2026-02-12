{{ config(materialized='table') }}

-- Erreur de COG sur la version 2024 d'Admin Express : le code commune de
-- Champtoceaux (49069) est toujours utilisé pour Orée d'Anjou alors que
-- cette commune n'existe plus. Le nouveau code est 49126.
WITH fixed_communes AS (
    SELECT
        REPLACE(commune_code, '49126', '49069') as commune_code,
        commune_name,
        {{ sum_rpls() }}
    FROM {{ ref('raw_rpls_commune') }}
    GROUP BY REPLACE(commune_code, '49126', '49069'), commune_name
)

SELECT * FROM fixed_communes
WHERE commune_code not in
{{ commune_changed_since('2024') }}
