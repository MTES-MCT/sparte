{{
    config(
        materialized='table',
        docs={'node_color': '#D70040'}
    )
}}

SELECT
    id,
    epci_id,
    departement_id
FROM
    {{ source('public', 'app_epci_departements') }}
