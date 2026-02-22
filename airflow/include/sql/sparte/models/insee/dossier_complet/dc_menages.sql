{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Ménages : nombre, taille, composition #}
{%- set years = ['22', '16', '11'] -%}
{%- set indicators = [
    ('MEN', 'menages'),
    ('MEN_ANEM0002', 'menages_emmenages_moins_2_ans'),
    ('MEN_ANEM0204', 'menages_emmenages_2_4_ans'),
    ('MEN_ANEM0509', 'menages_emmenages_5_9_ans'),
    ('MEN_ANEM10P', 'menages_emmenages_10_ans_plus'),
    ('PMEN', 'personnes_menages'),
    ('PMEN_ANEM0002', 'personnes_menages_moins_2_ans'),
    ('PMEN_ANEM0204', 'personnes_menages_2_4_ans'),
    ('PMEN_ANEM0509', 'personnes_menages_5_9_ans'),
    ('PMEN_ANEM10P', 'personnes_menages_10_ans_plus'),
    ('NPER_RP', 'nb_personnes_rp'),
    ('NPER_RP_PROP', 'nb_personnes_rp_proprietaires'),
    ('NPER_RP_LOC', 'nb_personnes_rp_locataires'),
    ('NPER_RP_LOCHLMV', 'nb_personnes_rp_hlm'),
    ('NPER_RP_GRAT', 'nb_personnes_rp_gratuit'),
] -%}

{# Complémentaire : familles #}
{%- set c_indicators = [
    ('FAM', 'familles'),
    ('FAMMONO', 'familles_monoparentales'),
    ('NE24F0', 'familles_0_enfant_moins_25'),
    ('NE24F1', 'familles_1_enfant_moins_25'),
    ('NE24F2', 'familles_2_enfants_moins_25'),
    ('NE24F3', 'familles_3_enfants_moins_25'),
    ('NE24F4P', 'familles_4_enfants_plus_moins_25'),
] -%}

{%- set columns = [] -%}
{%- for year in years -%}
{%- for var_code, var_name in indicators -%}
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
