{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

{% set fields_to_query = """
    surface,
    year,
    total,
    activite,
    habitat,
    mixte,
    route,
    ferroviaire,
    inconnu
""" %}


select
    commune_code as land_id,
    '{{ var('COMMUNE') }}' as land_type,
    {{ fields_to_query }}
from
    {{ ref('flux_consommation_commune') }}
union
select
    departement as land_id,
    '{{ var('DEPARTEMENT') }}' as land_type,
    {{ fields_to_query }}
from
    {{ ref('flux_consommation_departement') }}
union
select
    region as land_id,
    '{{ var('REGION') }}' as land_type,
    {{ fields_to_query }}
from
    {{ ref('flux_consommation_region') }}
union
select
    epci as land_id,
    '{{ var('EPCI') }}' as land_type,
    {{ fields_to_query }}
from
    {{ ref('flux_consommation_epci') }}
union
select
    scot as land_id,
    '{{ var('SCOT') }}' as land_type,
    {{ fields_to_query }}
from
    {{ ref('flux_consommation_scot') }}
