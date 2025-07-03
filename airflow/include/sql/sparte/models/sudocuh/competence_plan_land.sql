{{ config(materialized='table') }}

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
