{{ config(materialized="table", docs={"node_color": "purple"}) }}

{% set common_fields = """
    surface,
    artificial_surface,
    zonage_type,
    zonage_count,
    artificial_percent
""" %}

select
    commune as land_id,
    '{{ var("COMMUNE") }}' as land_type,
    string_to_array(departement, '') as departements,
    year,
    {{ common_fields }}
from {{ ref("artif_zonage_commune") }}
union all
select
    departement as land_id,
    '{{ var("DEPARTEMENT") }}' as land_type,
    departements as departements,
    year,
    {{ common_fields }}
from {{ ref("artif_zonage_departement") }}
union all
select
    region as land_id,
    '{{ var("REGION") }}' as land_type,
    departements as departements,
    year,
    {{ common_fields }}
from {{ ref("artif_zonage_region") }}
union all
select
    epci as land_id,
    '{{ var("EPCI") }}' as land_type,
    departements as departements,
    year,
    {{ common_fields }}
from {{ ref("artif_zonage_epci") }}
union all
select
    scot as land_id,
    '{{ var("SCOT") }}' as land_type,
    departements as departements,
    year,
    {{ common_fields }}
from {{ ref("artif_zonage_scot") }}
