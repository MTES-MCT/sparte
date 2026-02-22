{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set years = ['22', '16', '11'] -%}
{%- set p_names = [
    'emplois', 'emplois_salaries', 'emplois_salaries_femmes', 'emplois_salaries_temps_partiel',
    'emplois_non_salaries', 'emplois_non_salaries_femmes', 'emplois_non_salaries_temps_partiel',
] -%}

{%- set c_names = [
    'c_emplois', 'c_emplois_agriculteurs', 'c_emplois_artisans_commercants', 'c_emplois_cadres',
    'c_emplois_prof_intermediaires', 'c_emplois_employes', 'c_emplois_ouvriers',
    'c_emplois_agriculture', 'c_emplois_industrie', 'c_emplois_construction',
    'c_emplois_commerce_transports_services', 'c_emplois_admin_enseignement_sante',
    'c_emplois_femmes',
    'c_emplois_agriculture_femmes', 'c_emplois_industrie_femmes', 'c_emplois_construction_femmes',
    'c_emplois_commerce_transports_services_femmes', 'c_emplois_admin_enseignement_sante_femmes',
    'c_emplois_salaries',
    'c_emplois_agriculture_salaries', 'c_emplois_industrie_salaries', 'c_emplois_construction_salaries',
    'c_emplois_commerce_transports_services_salaries', 'c_emplois_admin_enseignement_sante_salaries',
    'c_emplois_agriculture_salaries_femmes', 'c_emplois_industrie_salaries_femmes',
    'c_emplois_construction_salaries_femmes', 'c_emplois_commerce_transports_services_salaries_femmes',
    'c_emplois_admin_enseignement_sante_salaries_femmes',
    'c_emplois_agriculture_non_salaries', 'c_emplois_industrie_non_salaries',
    'c_emplois_construction_non_salaries', 'c_emplois_commerce_transports_services_non_salaries',
    'c_emplois_admin_enseignement_sante_non_salaries',
    'c_emplois_agriculture_non_salaries_femmes', 'c_emplois_industrie_non_salaries_femmes',
    'c_emplois_construction_non_salaries_femmes', 'c_emplois_commerce_transports_services_non_salaries_femmes',
    'c_emplois_admin_enseignement_sante_non_salaries_femmes',
] -%}

{%- set columns = [] -%}
{%- for year in years -%}
{%- for name in p_names -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- for name in c_names -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_emplois_lieu_travail', columns) }}
