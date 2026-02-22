{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set secteur_names = [
    'industrie', 'construction', 'commerce_transports_hebergement',
    'information_communication', 'finance_assurance', 'immobilier',
    'services_entreprises', 'admin_enseignement_sante', 'autres_services',
] -%}

{%- set columns = [] -%}
{%- for year_num in range(12, 25) -%}
{%- do columns.append('creations_etablissements_20' ~ year_num) -%}
{%- for name in secteur_names -%}
{%- do columns.append('creations_etablissements_' ~ name ~ '_20' ~ year_num) -%}
{%- endfor -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_creations_etablissements', columns) }}
