{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    commune.code         AS commune_id,
    epci.code            AS epci_id,
    row_number() OVER () AS id
FROM
    {{ ref('commune') }} AS commune
INNER JOIN
    {{ ref('epci') }} AS epci
    ON
        st_intersects(commune.geom, epci.geom)
        AND NOT st_touches(commune.geom, epci.geom)
