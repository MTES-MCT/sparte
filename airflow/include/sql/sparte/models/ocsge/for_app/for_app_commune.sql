{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

with artif_commune_partitionned as (
    SELECT
        row_number() OVER (PARTITION BY commune_code ORDER BY year DESC) as rn,
        *
    FROM
        {{ ref('artificial_commune') }}

), latest_year_artif_commune as (
    SELECT
        *
    FROM
        artif_commune_partitionned
    WHERE
        rn = 1
), first_and_last_millesimes as (
    SELECT
        commune_code,
        MIN(year) as first_millesime,
        MAX(year) as last_millesime
    FROM
        {{ ref('occupation_du_sol_commune') }}
    GROUP BY
        commune_code
)
SELECT
    commune.id,
    commune.insee,
    commune.name,
    commune.departement_id,
    commune.epci_id,
    commune.scot_id,
    commune.map_color,
    CASE
        WHEN
            artif_commune.surface IS NOT NULL
            THEN true
        ELSE commune.ocsge_available
    END AS ocsge_available,
    millesimes.first_millesime as first_millesime,
    millesimes.last_millesime as last_millesime,
    COALESCE(
        CASE
            WHEN
                artif_commune.surface IS NOT NULL
                THEN artif_commune.surface / 10000
            ELSE
                NULL
        END,
        commune.surface_artif
    ) as surface_artif,
    admin_express_commune.surface / 10000 as area,
    ST_Transform(admin_express_commune.geom, 4326) as mpoly,
    admin_express_commune.srid_source as srid_source
FROM
    {{ ref('app_commune') }} as commune
LEFT JOIN
    latest_year_artif_commune as artif_commune
ON
    commune.insee = artif_commune.commune_code
LEFT JOIN
    first_and_last_millesimes as millesimes
ON
    commune.insee = millesimes.commune_code
LEFT JOIN
    {{ ref('commune') }} as admin_express_commune
ON
    commune.insee = admin_express_commune.code
