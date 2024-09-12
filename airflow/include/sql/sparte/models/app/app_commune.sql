{{
    config(
        materialized='table',
        docs={'node_color': '#D70040'}
    )
}}

SELECT
    id,
    insee,
    name,
    departement_id,
    epci_id,
    scot_id,
    ocsge_available,
    first_millesime,
    last_millesime,
    map_color,
    surface_artif
FROM
    {{ source('public', 'app_commune') }}
