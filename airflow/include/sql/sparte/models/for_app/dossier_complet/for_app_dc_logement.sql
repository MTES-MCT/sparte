{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set years = ['22', '16', '11'] -%}
{%- set common_cols = [
    'logements', 'residences_principales', 'residences_secondaires', 'logements_vacants',
    'maisons', 'appartements', 'rp_proprietaires', 'rp_locataires', 'rp_locataires_hlm',
    'rp_loges_gratuit', 'rp_maisons', 'rp_appartements', 'nb_pieces_rp',
    'rp_1_voiture_plus', 'rp_1_voiture', 'rp_2_voitures_plus', 'rp_garage',
    'rp_electricite', 'rp_eau_chaude',
] -%}

{%- set columns = [] -%}
{%- for year in years -%}
{%- for name in common_cols -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}

{# Ancienneté construction : noms différents par année #}
{%- for name in ['rp_ach_total', 'rp_avant_1919', 'rp_1919_1945', 'rp_1946_1970', 'rp_1971_1990', 'rp_1991_2005', 'rp_2006_2019'] -%}
{%- do columns.append(name ~ '_22') -%}
{%- endfor -%}
{%- for name in ['rp_ach_total', 'rp_avant_1919', 'rp_1919_1945', 'rp_1946_1970', 'rp_1971_1990', 'rp_1991_2005', 'rp_2006_2013'] -%}
{%- do columns.append(name ~ '_16') -%}
{%- endfor -%}
{%- for name in ['rp_ach_total', 'rp_avant_1946', 'rp_1946_1990', 'rp_1991_2008'] -%}
{%- do columns.append(name ~ '_11') -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_logement', columns) }}
