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




{% set common_fields = """
    code as land_id,
    departement,
    year,
    index,
    surface,
    artificial_surface,
    zonage_type,
    zonage_count,
    artificial_percent
""" %}

select
    '{{ var("COMMUNE") }}' as land_type,
    {{ common_fields }}
from {{ ref("artif_zonage_commune") }}
union all
select
    '{{ var("DEPARTEMENT") }}' as land_type,
    {{ common_fields }}
from {{ ref("artif_zonage_departement") }}
union all
select
    '{{ var("REGION") }}' as land_type,
    {{ common_fields }}
from {{ ref("artif_zonage_region") }}
union all
select
    '{{ var("EPCI") }}' as land_type,
    {{ common_fields }}
from {{ ref("artif_zonage_epci") }}
union all
select
    '{{ var("SCOT") }}' as land_type,
    {{ common_fields }}
from {{ ref("artif_zonage_scot") }}
