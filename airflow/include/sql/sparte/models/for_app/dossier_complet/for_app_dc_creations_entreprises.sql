{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set columns = [] -%}

{%- for year_num in range(12, 25) -%}
{%- do columns.append('creations_entreprises_20' ~ year_num) -%}
{%- endfor -%}
{%- for year_num in range(12, 25) -%}
{%- do columns.append('creations_individuelles_20' ~ year_num) -%}
{%- endfor -%}

{%- for name in ['creations_industrie', 'creations_construction',
    'creations_commerce_transports_hebergement', 'creations_information_communication',
    'creations_finance_assurance', 'creations_immobilier', 'creations_services_entreprises',
    'creations_admin_enseignement_sante', 'creations_autres_services'] -%}
{%- do columns.append(name) -%}
{%- endfor -%}

{%- for name in ['creations_individuelles_industrie', 'creations_individuelles_construction',
    'creations_individuelles_commerce_transports_hebergement', 'creations_individuelles_information_communication',
    'creations_individuelles_finance_assurance', 'creations_individuelles_immobilier',
    'creations_individuelles_services_entreprises', 'creations_individuelles_admin_enseignement_sante',
    'creations_individuelles_autres_services'] -%}
{%- do columns.append(name) -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_creations_entreprises', columns) }}
