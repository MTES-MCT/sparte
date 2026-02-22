{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set years = ['22', '16', '11'] -%}
{%- set indicator_names = [
    'pop_1an_plus', 'pop_meme_logement', 'pop_autre_logement_meme_commune',
    'pop_autre_commune_meme_dept', 'pop_autre_dept_meme_region',
    'pop_autre_region_metropole', 'pop_dom', 'pop_hors_metro_dom',
    'pop_0_14_autre_logement', 'pop_0_14_autre_logt_meme_commune', 'pop_0_14_autre_commune',
    'pop_15_24_autre_logement', 'pop_15_24_autre_logt_meme_commune', 'pop_15_24_autre_commune',
    'pop_25_54_autre_logement', 'pop_25_54_autre_logt_meme_commune', 'pop_25_54_autre_commune',
    'pop_55_plus_autre_logement', 'pop_55_plus_autre_logt_meme_commune', 'pop_55_plus_autre_commune',
] -%}

{%- set columns = [] -%}
{%- for year in years -%}
{%- for name in indicator_names -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_mobilite_residentielle', columns) }}
