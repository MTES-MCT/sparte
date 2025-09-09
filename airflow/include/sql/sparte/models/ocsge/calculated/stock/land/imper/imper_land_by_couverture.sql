{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["land_id"], "type": "btree"},
            {"columns": ["land_type"], "type": "btree"},
            {"columns": ["year"], "type": "btree"},
        ],
    )
}}


{% set common_fields = "departement, year, percent_of_land, surface, couverture, percent_of_indicateur, index" %}


select
    code as land_id,
    '{{ var("COMMUNE") }}' as land_type,
    {{ common_fields }}
from {{ ref("imper_commune_by_couverture") }}
union all
select
    code as land_id,
    '{{ var("DEPARTEMENT") }}' as land_type,
    {{ common_fields }}
from {{ ref("imper_departement_by_couverture") }}
union all
select
    code as land_id,
    '{{ var("REGION") }}' as land_type,
    {{ common_fields }}
from {{ ref("imper_region_by_couverture") }}
union all
select
    code as land_id, '{{ var("EPCI") }}' as land_type, {{ common_fields }}
from {{ ref("imper_epci_by_couverture") }}
union all
select
    code as land_id, '{{ var("SCOT") }}' as land_type, {{ common_fields }}
from {{ ref("imper_scot_by_couverture") }}
