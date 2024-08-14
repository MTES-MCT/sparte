
{{ config(materialized='table') }}

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
    surface_artif
FROM
    {{ source('public', 'app_commune') }}
