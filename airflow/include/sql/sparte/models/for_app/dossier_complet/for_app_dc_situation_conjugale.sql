{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{# Colonnes par année - nomenclatures différentes #}
{%- set common_names = [
    'pop_15_plus',
    'pop_15_19', 'pop_20_24', 'pop_25_39', 'pop_40_54', 'pop_55_64', 'pop_65_79', 'pop_80_plus',
    'pop_menages_15_19', 'pop_menages_20_24', 'pop_menages_25_39', 'pop_menages_40_54',
    'pop_menages_55_64', 'pop_menages_65_79', 'pop_menages_80_plus',
    'pop_15_19_seul', 'pop_20_24_seul', 'pop_25_39_seul', 'pop_40_54_seul',
    'pop_55_64_seul', 'pop_65_79_seul', 'pop_80_plus_seul',
    'pop_15_19_couple', 'pop_20_24_couple', 'pop_25_39_couple', 'pop_40_54_couple',
    'pop_55_64_couple', 'pop_65_79_couple', 'pop_80_plus_couple',
] -%}

{%- set columns = [] -%}

{# Communs 22, 16, 11 #}
{%- for year in ['22', '16', '11'] -%}
{%- for name in common_names -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}

{# Spécifiques P22 #}
{%- for name in ['pop_15_plus_maries', 'pop_15_plus_pacses', 'pop_15_plus_concubinage', 'pop_15_plus_veufs', 'pop_15_plus_divorces', 'pop_15_plus_celibataires'] -%}
{%- do columns.append(name ~ '_22') -%}
{%- endfor -%}

{# Spécifiques P16 #}
{%- for name in ['pop_15_plus_maries', 'pop_15_plus_non_maries'] -%}
{%- do columns.append(name ~ '_16') -%}
{%- endfor -%}

{# Spécifiques P11 #}
{%- for name in ['pop_15_plus_maries', 'pop_15_plus_celibataires', 'pop_15_plus_veufs', 'pop_15_plus_divorces'] -%}
{%- do columns.append(name ~ '_11') -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_situation_conjugale', columns) }}
