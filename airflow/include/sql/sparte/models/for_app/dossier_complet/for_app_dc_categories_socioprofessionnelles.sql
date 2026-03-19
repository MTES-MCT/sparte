{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set csp_names_22 = [
    'pop_15_plus', 'pop_15_plus_agriculteurs', 'pop_15_plus_artisans_commercants',
    'pop_15_plus_cadres', 'pop_15_plus_prof_intermediaires', 'pop_15_plus_employes',
    'pop_15_plus_ouvriers', 'pop_15_plus_retraites', 'pop_15_plus_autres_inactifs',
    'hommes_15_plus', 'hommes_15_plus_agriculteurs', 'hommes_15_plus_artisans_commercants',
    'hommes_15_plus_cadres', 'hommes_15_plus_prof_intermediaires', 'hommes_15_plus_employes',
    'hommes_15_plus_ouvriers',
    'femmes_15_plus', 'femmes_15_plus_agriculteurs', 'femmes_15_plus_artisans_commercants',
    'femmes_15_plus_cadres', 'femmes_15_plus_prof_intermediaires', 'femmes_15_plus_employes',
    'femmes_15_plus_ouvriers',
    'pop_15_24', 'pop_15_24_agriculteurs', 'pop_15_24_artisans_commercants',
    'pop_15_24_cadres', 'pop_15_24_prof_intermediaires', 'pop_15_24_employes', 'pop_15_24_ouvriers',
    'pop_25_54', 'pop_25_54_agriculteurs', 'pop_25_54_artisans_commercants',
    'pop_25_54_cadres', 'pop_25_54_prof_intermediaires', 'pop_25_54_employes', 'pop_25_54_ouvriers',
    'pop_55_plus', 'pop_55_plus_agriculteurs', 'pop_55_plus_artisans_commercants',
    'pop_55_plus_cadres', 'pop_55_plus_prof_intermediaires', 'pop_55_plus_employes', 'pop_55_plus_ouvriers',
    'menages_agriculteurs', 'menages_artisans_commercants', 'menages_cadres',
    'menages_prof_intermediaires', 'menages_employes', 'menages_ouvriers',
    'pop_menages_agriculteurs', 'pop_menages_artisans_commercants', 'pop_menages_cadres',
    'pop_menages_prof_intermediaires', 'pop_menages_employes', 'pop_menages_ouvriers',
] -%}

{%- set csp_names_16_11 = [
    'pop_15_plus', 'pop_15_plus_agriculteurs', 'pop_15_plus_artisans_commercants',
    'pop_15_plus_cadres', 'pop_15_plus_prof_intermediaires', 'pop_15_plus_employes',
    'pop_15_plus_ouvriers',
    'hommes_15_plus', 'hommes_15_plus_agriculteurs', 'hommes_15_plus_artisans_commercants',
    'hommes_15_plus_cadres', 'hommes_15_plus_prof_intermediaires', 'hommes_15_plus_employes',
    'hommes_15_plus_ouvriers',
    'femmes_15_plus', 'femmes_15_plus_agriculteurs', 'femmes_15_plus_artisans_commercants',
    'femmes_15_plus_cadres', 'femmes_15_plus_prof_intermediaires', 'femmes_15_plus_employes',
    'femmes_15_plus_ouvriers',
    'pop_15_24', 'pop_15_24_agriculteurs', 'pop_15_24_artisans_commercants',
    'pop_15_24_cadres', 'pop_15_24_prof_intermediaires', 'pop_15_24_employes', 'pop_15_24_ouvriers',
    'pop_25_54', 'pop_25_54_agriculteurs', 'pop_25_54_artisans_commercants',
    'pop_25_54_cadres', 'pop_25_54_prof_intermediaires', 'pop_25_54_employes', 'pop_25_54_ouvriers',
    'pop_55_plus', 'pop_55_plus_agriculteurs', 'pop_55_plus_artisans_commercants',
    'pop_55_plus_cadres', 'pop_55_plus_prof_intermediaires', 'pop_55_plus_employes', 'pop_55_plus_ouvriers',
    'menages_agriculteurs', 'menages_artisans_commercants', 'menages_cadres',
    'menages_prof_intermediaires', 'menages_employes', 'menages_ouvriers',
    'pop_menages_agriculteurs', 'pop_menages_artisans_commercants', 'pop_menages_cadres',
    'pop_menages_prof_intermediaires', 'pop_menages_employes', 'pop_menages_ouvriers',
] -%}

{%- set columns = [] -%}
{%- for name in csp_names_22 -%}
{%- do columns.append(name ~ '_22') -%}
{%- endfor -%}
{%- for year in ['16', '11'] -%}
{%- for name in csp_names_16_11 -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_categories_socioprofessionnelles', columns) }}
