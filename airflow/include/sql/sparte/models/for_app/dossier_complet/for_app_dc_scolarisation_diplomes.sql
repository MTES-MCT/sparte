{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set scol_names = [
    'pop_2_5', 'pop_6_10', 'pop_11_14', 'pop_15_17', 'pop_18_24', 'pop_25_29', 'pop_30_plus',
    'scol_2_5', 'scol_6_10', 'scol_11_14', 'scol_15_17', 'scol_18_24', 'scol_25_29', 'scol_30_plus',
] -%}

{%- set dipl_22 = [
    'non_scol_15_plus', 'non_scol_sans_diplome', 'non_scol_bepc', 'non_scol_cap_bep',
    'non_scol_bac', 'non_scol_bac_plus_2', 'non_scol_bac_plus_3_4', 'non_scol_bac_plus_5',
    'hommes_non_scol_15_plus', 'hommes_non_scol_sans_diplome', 'hommes_non_scol_bepc',
    'hommes_non_scol_cap_bep', 'hommes_non_scol_bac', 'hommes_non_scol_bac_plus_2',
    'hommes_non_scol_bac_plus_3_4', 'hommes_non_scol_bac_plus_5',
    'femmes_non_scol_15_plus', 'femmes_non_scol_sans_diplome', 'femmes_non_scol_bepc',
    'femmes_non_scol_cap_bep', 'femmes_non_scol_bac', 'femmes_non_scol_bac_plus_2',
    'femmes_non_scol_bac_plus_3_4', 'femmes_non_scol_bac_plus_5',
] -%}

{%- set dipl_16 = [
    'non_scol_15_plus', 'non_scol_sans_diplome', 'non_scol_cap_bep', 'non_scol_bac', 'non_scol_sup',
    'hommes_non_scol_15_plus', 'hommes_non_scol_sans_diplome', 'hommes_non_scol_cap_bep',
    'hommes_non_scol_bac', 'hommes_non_scol_sup',
    'femmes_non_scol_15_plus', 'femmes_non_scol_sans_diplome', 'femmes_non_scol_cap_bep',
    'femmes_non_scol_bac', 'femmes_non_scol_sup',
] -%}

{%- set dipl_11 = [
    'non_scol_15_plus', 'non_scol_aucun_diplome', 'non_scol_cep', 'non_scol_bepc',
    'non_scol_cap_bep', 'non_scol_bac', 'non_scol_bac_plus_2', 'non_scol_sup',
    'hommes_non_scol_15_plus', 'hommes_non_scol_aucun_diplome', 'hommes_non_scol_cep',
    'hommes_non_scol_bepc', 'hommes_non_scol_cap_bep', 'hommes_non_scol_bac',
    'hommes_non_scol_bac_plus_2', 'hommes_non_scol_sup',
    'femmes_non_scol_15_plus', 'femmes_non_scol_aucun_diplome', 'femmes_non_scol_cep',
    'femmes_non_scol_bepc', 'femmes_non_scol_cap_bep', 'femmes_non_scol_bac',
    'femmes_non_scol_bac_plus_2', 'femmes_non_scol_sup',
] -%}

{%- set columns = [] -%}
{%- for year in ['22', '16', '11'] -%}
{%- for name in scol_names -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}
{%- for name in dipl_22 -%}{%- do columns.append(name ~ '_22') -%}{%- endfor -%}
{%- for name in dipl_16 -%}{%- do columns.append(name ~ '_16') -%}{%- endfor -%}
{%- for name in dipl_11 -%}{%- do columns.append(name ~ '_11') -%}{%- endfor -%}

{{ aggregate_dc_to_land('dc_scolarisation_diplomes', columns) }}
