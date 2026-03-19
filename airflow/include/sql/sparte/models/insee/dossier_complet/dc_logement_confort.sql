{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Logement complémentaire : occupation, chauffage, confort, ancienneté #}
{%- set years = ['22', '16', '11'] -%}

{# Indicateurs P : chauffage, confort, pièces, ancienneté #}
{%- set p_indicators = [
    ('RP_CGAZV', 'rp_chauffage_gaz_ville'),
    ('RP_CFIOUL', 'rp_chauffage_fioul'),
    ('RP_CELEC', 'rp_chauffage_electricite'),
    ('RP_CGAZB', 'rp_chauffage_gaz_bouteille'),
    ('RP_CAUT', 'rp_chauffage_autre'),
    ('RP_BDWC', 'rp_bain_douche_wc'),
    ('RP_CHOS', 'rp_chauffe_eau_solaire'),
    ('RP_CLIM', 'rp_climatisation'),
    ('RP_TTEGOU', 'rp_tout_a_egout'),
    ('RP_HABFOR', 'rp_habitations_fortune'),
    ('RP_CASE', 'rp_cases_traditionnelles'),
    ('RP_MIBOIS', 'rp_maisons_bois'),
    ('RP_MIDUR', 'rp_maisons_dur'),
    ('RP_1P', 'rp_1_piece'),
    ('RP_2P', 'rp_2_pieces'),
    ('RP_3P', 'rp_3_pieces'),
    ('RP_4P', 'rp_4_pieces'),
    ('RP_5PP', 'rp_5_pieces_plus'),
    ('ANEM_RP', 'anciennete_rp'),
    ('ANEM_RP_PROP', 'anciennete_rp_proprietaires'),
    ('ANEM_RP_LOC', 'anciennete_rp_locataires'),
    ('ANEM_RP_LOCHLMV', 'anciennete_rp_hlm'),
    ('ANEM_RP_GRAT', 'anciennete_rp_gratuit'),
] -%}

{# Indicateurs C : occupation normée #}
{%- set c_indicators = [
    ('RP_NORME', 'rp_occupation_normale'),
    ('RP_SOUSOCC_MOD', 'rp_sous_occupation_moderee'),
    ('RP_SOUSOCC_ACC', 'rp_sous_occupation_accentuee'),
    ('RP_SOUSOCC_TACC', 'rp_sous_occupation_tres_accentuee'),
    ('RP_SUROCC_MOD', 'rp_suroccupation_moderee'),
    ('RP_SUROCC_ACC', 'rp_suroccupation_accentuee'),
] -%}

{%- set columns = [] -%}

{%- for year in years -%}
{%- for var_code, var_name in p_indicators -%}
{%- do columns.append(("P" ~ year ~ "_" ~ var_code, var_name ~ "_" ~ year)) -%}
{%- endfor -%}
{%- for var_code, var_name in c_indicators -%}
{%- do columns.append(("C" ~ year ~ "_" ~ var_code, var_name ~ "_" ~ year)) -%}
{%- endfor -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in columns %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
