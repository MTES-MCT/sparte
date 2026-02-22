{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set secteur_names = [
    'industrie', 'construction', 'commerce_transports_hebergement',
    'information_communication', 'finance_assurance', 'immobilier',
    'services_entreprises', 'admin_enseignement_sante', 'autres_services',
] -%}

{%- set columns = ['unites_legales_total'] -%}
{%- for name in secteur_names -%}
{%- do columns.append('unites_legales_' ~ name) -%}
{%- endfor -%}
{%- do columns.append('etablissements_actifs_total') -%}
{%- for name in secteur_names -%}
{%- do columns.append('etablissements_actifs_' ~ name) -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_unites_legales_actives', columns) }}
