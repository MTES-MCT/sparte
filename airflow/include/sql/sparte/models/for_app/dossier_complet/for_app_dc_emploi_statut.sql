{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set years = ['22', '16', '11'] -%}
{%- set indicator_names = [
    'actifs_occupes_15_plus', 'salaries_15_plus', 'non_salaries_15_plus',
    'actifs_occupes_temps_partiel', 'salaries_temps_partiel',
    'hommes_salaries_temps_partiel', 'femmes_salaries_temps_partiel', 'non_salaries_temps_partiel',
    'hommes_actifs_occupes', 'femmes_actifs_occupes', 'hommes_salaries', 'femmes_salaries',
    'hommes_salaries_cdi', 'hommes_salaries_cdd', 'hommes_salaries_interim',
    'hommes_salaries_emplois_aides', 'hommes_salaries_apprentissage',
    'femmes_salaries_cdi', 'femmes_salaries_cdd', 'femmes_salaries_interim',
    'femmes_salaries_emplois_aides', 'femmes_salaries_apprentissage',
    'hommes_non_salaries', 'hommes_non_salaries_independants',
    'hommes_non_salaries_employeurs', 'hommes_non_salaries_aide_familiale',
    'femmes_non_salaries', 'femmes_non_salaries_independantes',
    'femmes_non_salaries_employeurs', 'femmes_non_salaries_aide_familiale',
    'hommes_salaries_15_64', 'hommes_salaries_15_24', 'hommes_salaries_25_54', 'hommes_salaries_55_64',
    'hommes_salaries_15_64_temps_partiel', 'hommes_salaries_15_24_temps_partiel',
    'hommes_salaries_25_54_temps_partiel', 'hommes_salaries_55_64_temps_partiel',
    'femmes_salaries_15_64', 'femmes_salaries_15_24', 'femmes_salaries_25_54', 'femmes_salaries_55_64',
    'femmes_salaries_15_64_temps_partiel', 'femmes_salaries_15_24_temps_partiel',
    'femmes_salaries_25_54_temps_partiel', 'femmes_salaries_55_64_temps_partiel',
] -%}

{%- set columns = [] -%}
{%- for year in years -%}
{%- for name in indicator_names -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_emploi_statut', columns) }}
