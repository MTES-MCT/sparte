{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set years = ['22', '16', '11'] -%}
{%- set p_indicators = [
    'menages', 'menages_emmenages_moins_2_ans', 'menages_emmenages_2_4_ans',
    'menages_emmenages_5_9_ans', 'menages_emmenages_10_ans_plus',
    'personnes_menages', 'personnes_menages_moins_2_ans', 'personnes_menages_2_4_ans',
    'personnes_menages_5_9_ans', 'personnes_menages_10_ans_plus',
    'nb_personnes_rp', 'nb_personnes_rp_proprietaires', 'nb_personnes_rp_locataires',
    'nb_personnes_rp_hlm', 'nb_personnes_rp_gratuit',
] -%}
{%- set c_indicators = [
    'familles', 'familles_monoparentales',
    'familles_0_enfant_moins_25', 'familles_1_enfant_moins_25',
    'familles_2_enfants_moins_25', 'familles_3_enfants_moins_25',
    'familles_4_enfants_plus_moins_25',
] -%}

{%- set columns = [] -%}
{%- for year in years -%}
{%- for name in p_indicators -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- for name in c_indicators -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_menages', columns) }}
