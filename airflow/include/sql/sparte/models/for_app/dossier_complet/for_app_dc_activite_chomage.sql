{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{# Lire le modèle source pour la liste exacte des colonnes #}
{%- set common_names = [
    'pop_15_64', 'hommes_15_64', 'hommes_15_24', 'hommes_25_54', 'hommes_55_64',
    'femmes_15_64', 'femmes_15_24', 'femmes_25_54', 'femmes_55_64',
    'actifs_15_64', 'actifs_15_24', 'actifs_25_54', 'actifs_55_64',
    'hommes_actifs_15_64', 'hommes_actifs_15_24', 'hommes_actifs_25_54', 'hommes_actifs_55_64',
    'femmes_actifs_15_64', 'femmes_actifs_15_24', 'femmes_actifs_25_54', 'femmes_actifs_55_64',
    'actifs_occupes_15_64', 'actifs_occupes_15_24', 'actifs_occupes_25_54', 'actifs_occupes_55_64',
    'hommes_actifs_occupes_15_64', 'hommes_actifs_occupes_15_24', 'hommes_actifs_occupes_25_54', 'hommes_actifs_occupes_55_64',
    'femmes_actifs_occupes_15_64', 'femmes_actifs_occupes_15_24', 'femmes_actifs_occupes_25_54', 'femmes_actifs_occupes_55_64',
    'chomeurs_15_64', 'inactifs_15_64', 'etudiants_15_64', 'retraites_15_64', 'autres_inactifs_15_64',
] -%}

{%- set columns = [] -%}

{# Communs P22, P16, P11 #}
{%- for year in ['22', '16', '11'] -%}
{%- for name in common_names -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}

{# POP1524/POP2554 P22+P16 #}
{%- for year in ['22', '16'] -%}
{%- do columns.append('pop_15_24_' ~ year) -%}
{%- do columns.append('pop_25_54_' ~ year) -%}
{%- endfor -%}

{# Chômage détaillé P22 #}
{%- for name in ['chomeurs_15_24', 'chomeurs_25_54', 'chomeurs_55_64',
    'hommes_chomeurs_15_64', 'hommes_chomeurs_15_24', 'hommes_chomeurs_25_54', 'hommes_chomeurs_55_64',
    'femmes_chomeurs_15_64', 'femmes_chomeurs_15_24', 'femmes_chomeurs_25_54', 'femmes_chomeurs_55_64'] -%}
{%- do columns.append(name ~ '_22') -%}
{%- endfor -%}

{# Chômage par diplôme P22 #}
{%- for name in ['chomeurs_sans_diplome', 'chomeurs_bepc', 'chomeurs_cap_bep', 'chomeurs_bac',
    'chomeurs_bac_plus_2', 'chomeurs_bac_plus_3_4', 'chomeurs_bac_plus_5',
    'actifs_sans_diplome', 'actifs_bepc', 'actifs_cap_bep', 'actifs_bac',
    'actifs_bac_plus_2', 'actifs_bac_plus_3_4', 'actifs_bac_plus_5'] -%}
{%- do columns.append(name ~ '_22') -%}
{%- endfor -%}

{# CSP C22 #}
{%- for name in ['c_actifs_15_64', 'c_actifs_15_64_agriculteurs', 'c_actifs_15_64_artisans_commercants',
    'c_actifs_15_64_cadres', 'c_actifs_15_64_prof_intermediaires', 'c_actifs_15_64_employes', 'c_actifs_15_64_ouvriers',
    'c_actifs_occupes_15_64', 'c_actifs_occupes_15_64_agriculteurs', 'c_actifs_occupes_15_64_artisans_commercants',
    'c_actifs_occupes_15_64_cadres', 'c_actifs_occupes_15_64_prof_intermediaires',
    'c_actifs_occupes_15_64_employes', 'c_actifs_occupes_15_64_ouvriers'] -%}
{%- do columns.append(name ~ '_22') -%}
{%- endfor -%}

{# CSP C16, C11 #}
{%- for year in ['16', '11'] -%}
{%- for name in ['c_actifs_15_64', 'c_actifs_15_64_agriculteurs', 'c_actifs_15_64_artisans_commercants',
    'c_actifs_15_64_cadres', 'c_actifs_15_64_prof_intermediaires', 'c_actifs_15_64_employes', 'c_actifs_15_64_ouvriers',
    'c_actifs_occupes_15_64', 'c_actifs_occupes_15_64_agriculteurs', 'c_actifs_occupes_15_64_artisans_commercants',
    'c_actifs_occupes_15_64_cadres', 'c_actifs_occupes_15_64_prof_intermediaires',
    'c_actifs_occupes_15_64_employes', 'c_actifs_occupes_15_64_ouvriers'] -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_activite_chomage', columns) }}
