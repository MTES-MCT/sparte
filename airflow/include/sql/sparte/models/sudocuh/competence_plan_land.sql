{{
    config(
        materialized='table',
        indexes=[{"columns": ["land_id", "land_type"], "type": "btree"}]
    )
}}

SELECT
commune_code as land_id,
'{{ var('COMMUNE') }}' as land_type,
competence_planification
FROM
{{ ref('competence_plan_commune')}}
UNION ALL
SELECT
epci_code as land_id,
'{{ var('EPCI') }}' as land_type,
competence_planification
FROM
{{ ref('competence_plan_epci')}}
