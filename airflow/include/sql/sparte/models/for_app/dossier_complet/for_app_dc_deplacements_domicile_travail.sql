{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set common_names = [
    'travaille_commune_residence', 'travaille_autre_commune',
    'travaille_autre_commune_meme_dept', 'travaille_autre_dept_meme_region',
    'travaille_autre_region', 'travaille_hors_metropole',
    'transport_aucun', 'transport_marche', 'transport_voiture', 'transport_commun',
] -%}

{%- set columns = [] -%}

{# Communs 22, 16, 11 #}
{%- for year in ['22', '16', '11'] -%}
{%- for name in common_names -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}

{# P22 spécifiques #}
{%- do columns.append('transport_velo_22') -%}
{%- do columns.append('transport_deux_roues_motorise_22') -%}

{# P16, P11 spécifiques #}
{%- for year in ['16', '11'] -%}
{%- do columns.append('transport_deux_roues_' ~ year) -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_deplacements_domicile_travail', columns) }}
