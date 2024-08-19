{{ config(materialized='table') }}

with millesimes AS (
    SELECT
        departement,
        ARRAY_AGG(DISTINCT year) as ocsge_millesimes
    FROM
        {{ ref('occupation_du_sol') }}
    GROUP BY
        departement
)
SELECT
    app_departement.id,
    app_departement.source_id,
    app_departement.name,
    app_departement.region_id,
    CASE
        WHEN
            millesimes.ocsge_millesimes IS NOT NULL
            THEN true
        ELSE false
    END AS is_artif_ready,
    millesimes.ocsge_millesimes,
    ST_Transform(admin_express_departement.geom, 4326) as mpoly,
    2154 as srid_source
FROM
    {{ ref('app_departement') }} as app_departement
LEFT JOIN
    {{ ref('departement') }} as admin_express_departement
ON
    app_departement.source_id = admin_express_departement.code
LEFT JOIN
    millesimes
ON
    app_departement.source_id = millesimes.departement
