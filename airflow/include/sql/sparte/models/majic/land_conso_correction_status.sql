{{
    config(
        materialized='table',
        indexes=[{"columns": ["land_id", "land_type"], "type": "btree"}]
    )
}}


with commune_status as (
SELECT
    unnest(array_agg(correction_status)) as correction_status,
    commune_code
FROM
    {{ ref('consommation_cog_2025') }}
GROUP BY
    commune_code
ORDER BY
    commune_code
), status_with_collectivite_fields as (
SELECT
    commune_status.correction_status,
    commune.code as commune_code,
    commune.epci,
    commune.departement,
    commune.region,
    commune.scot
FROM
    commune_status
LEFt JOIN
    {{ ref('commune') }} as commune
ON
    commune.code = commune_status.commune_code
), all_status_as_array as (
SELECt
    '{{ var('COMMUNE') }}' as land_type,
    commune_code as land_id,
    string_to_array(correction_status, '') as correction_status
FROM status_with_collectivite_fields
UNION
SELECT
    '{{ var('EPCI') }}' as land_type,
    epci as land_id,
    array_agg(distinct correction_status) as correction_status
FROM status_with_collectivite_fields
WHERE epci IS NOT NULL
GROUP By epci
UNION
SELECT
    '{{ var('DEPARTEMENT') }}' as land_type,
    departement as land_id,
     array_agg(distinct correction_status) as correction_status
FROM status_with_collectivite_fields
GROUP BY departement
UNION
SELECT
    '{{ var('REGION') }}' as land_type,
    region as land_id,
     array_agg(distinct correction_status) as correction_status
FROM status_with_collectivite_fields
GROUP BY region
UNION
SELECT
    '{{ var('SCOT') }}' as land_type,
    scot as land_id,
     array_agg(distinct correction_status) as correction_status
FROM status_with_collectivite_fields
WHERE
    scot IS NOT NULL
GROUP BY scot
UNION
SELECT
    '{{ var('CUSTOM') }}' as land_type,
    clc.custom_land_id as land_id,
    array_agg(distinct correction_status) as correction_status
FROM status_with_collectivite_fields
INNER JOIN {{ ref('commune_custom_land') }} as clc
    ON clc.commune_code = status_with_collectivite_fields.commune_code
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY clc.custom_land_id
UNION
SELECT
    '{{ var('NATION') }}' as land_type,
    '{{ var('NATION') }}' as land_id,
    array_agg(distinct correction_status) as correction_status
FROM status_with_collectivite_fields
)
SELECT
    land_type,
    land_id,
    -- ⚠️ NE PAS RÉORDONNER CES BRANCHES.
    -- `ARRAY[...] @> correction_status` teste l'inclusion, pas l'égalité : la condition
    -- est vraie dès que correction_status est un SOUS-ENSEMBLE du tableau écrit. Une même
    -- valeur satisfait donc plusieurs branches ({UNCHANGED} en satisfait 8 sur 15), et
    -- CASE retient la première rencontrée.
    -- Les branches sont triées par taille de tableau croissante, ce qui garantit qu'une
    -- combinaison est toujours testée avant celles qui la contiennent. Remonter par
    -- exemple ARRAY['UNCHANGED', 'COG_ERROR'] au-dessus de ARRAY['UNCHANGED'] étiquetterait
    -- tous les territoires intacts en 'données_partiellement_coriggées', sans erreur SQL.
    -- À taille égale l'ordre est indifférent.
    --
    -- DIVISION (commune reconstruite par découpage d'une commune source) a sa propre
    -- famille de libellés `données_divisées*`, distincte de `données_coriggées*`
    -- (COG_ERROR) : le message affiché à l'utilisateur n'est pas le même.
    -- Quand les deux statuts cohabitent, la famille `coriggées` l'emporte, son message
    -- couvrant déjà le cas.
    CASE
        WHEN ARRAY['UNCHANGED'] @> correction_status THEN 'données_inchangées'
        WHEN ARRAY['MISSING_FROM_SOURCE'] @> correction_status THEN 'données_manquantes'
        WHEN ARRAY['COG_ERROR'] @> correction_status THEN 'données_coriggées'
        WHEN ARRAY['DIVISION'] @> correction_status THEN 'données_divisées'
        WHEN ARRAY['COG_ERROR', 'DIVISION'] @> correction_status THEN 'données_coriggées'
        WHEN ARRAY['UNCHANGED', 'COG_ERROR'] @> correction_status THEN 'données_partiellement_coriggées'
        WHEN ARRAY['UNCHANGED', 'DIVISION'] @> correction_status THEN 'données_partiellement_divisées'
        WHEN ARRAY['UNCHANGED', 'COG_ERROR', 'DIVISION'] @> correction_status THEN 'données_partiellement_coriggées'
        WHEN ARRAY['UNCHANGED', 'MISSING_FROM_SOURCE'] @> correction_status THEN 'données_inchangées_avec_données_manquantes'
        WHEN ARRAY['COG_ERROR', 'MISSING_FROM_SOURCE'] @> correction_status THEN 'données_coriggées_avec_données_manquantes'
        WHEN ARRAY['DIVISION', 'MISSING_FROM_SOURCE'] @> correction_status THEN 'données_divisées_avec_données_manquantes'
        WHEN ARRAY['COG_ERROR', 'DIVISION', 'MISSING_FROM_SOURCE'] @> correction_status THEN 'données_coriggées_avec_données_manquantes'
        WHEN ARRAY['UNCHANGED', 'COG_ERROR', 'MISSING_FROM_SOURCE'] @> correction_status THEN 'données_partiellement_coriggées_avec_données_manquantes'
        WHEN ARRAY['UNCHANGED', 'DIVISION', 'MISSING_FROM_SOURCE'] @> correction_status THEN 'données_partiellement_divisées_avec_données_manquantes'
        WHEN ARRAY['UNCHANGED', 'COG_ERROR', 'DIVISION', 'MISSING_FROM_SOURCE'] @> correction_status THEN 'données_partiellement_coriggées_avec_données_manquantes'
        ELSE 'ERROR'
    END as consommation_correction_status
FROM all_status_as_array
