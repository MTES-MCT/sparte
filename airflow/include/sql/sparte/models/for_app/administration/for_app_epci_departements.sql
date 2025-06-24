{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    epci.code            AS epci_id,
    departement.code     AS departement_id,
    row_number() OVER () AS id
FROM
    {{ ref('epci') }} AS epci
INNER JOIN
    {{ ref('departement') }} AS departement
    ON
        st_intersects(epci.geom, departement.geom)
        AND NOT st_touches(epci.geom, departement.geom)
