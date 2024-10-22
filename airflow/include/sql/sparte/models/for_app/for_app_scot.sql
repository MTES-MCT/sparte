{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    scot.epci_porteur_siren as siren,
    scot.id_scot as source_id,
    scot.nom_scot as name,
    ST_Transform(scot.geom, 4326) as mpoly,
    scot.srid_source as srid_source
FROM
    {{ ref('scot') }} as scot
WHERE geom IS NOT NULL
