{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set years = ['22', '16', '11'] -%}
{%- set p_names = [
    'rp_chauffage_gaz_ville', 'rp_chauffage_fioul', 'rp_chauffage_electricite',
    'rp_chauffage_gaz_bouteille', 'rp_chauffage_autre',
    'rp_bain_douche_wc', 'rp_chauffe_eau_solaire', 'rp_climatisation', 'rp_tout_a_egout',
    'rp_habitations_fortune', 'rp_cases_traditionnelles', 'rp_maisons_bois', 'rp_maisons_dur',
    'rp_1_piece', 'rp_2_pieces', 'rp_3_pieces', 'rp_4_pieces', 'rp_5_pieces_plus',
    'anciennete_rp', 'anciennete_rp_proprietaires', 'anciennete_rp_locataires',
    'anciennete_rp_hlm', 'anciennete_rp_gratuit',
] -%}
{%- set c_names = [
    'rp_occupation_normale', 'rp_sous_occupation_moderee', 'rp_sous_occupation_accentuee',
    'rp_sous_occupation_tres_accentuee', 'rp_suroccupation_moderee', 'rp_suroccupation_accentuee',
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

{{ aggregate_dc_to_land('dc_logement_confort', columns) }}
