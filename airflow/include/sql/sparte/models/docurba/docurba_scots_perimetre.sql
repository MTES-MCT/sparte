{{ config(materialized='table') }}

SELECT
    annee_cog::int as annee_cog,
    collectivite_code,
    collectivite_type,
    procedure_id,
    type_document,
    opposable::boolean as opposable
FROM
    {{ source('public', 'docurba_scots_perimetre') }}
