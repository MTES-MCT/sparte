{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

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
    array_length(millesimes.ocsge_millesimes, 1) > 1 AS is_artif_ready,
    millesimes.ocsge_millesimes,
    ST_Transform(admin_express_departement.geom, 4326) as mpoly,
    admin_express_departement.srid_source
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
