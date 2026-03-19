{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Déplacements domicile-travail : lieu de travail et mode de transport #}

{# P22 distingue VELO et 2ROUESMOT ; P16/P11 ont 2ROUES combiné #}
{%- set indicators_22 = [
    ('ACTOCC15P_ILT1', 'travaille_commune_residence'),
    ('ACTOCC15P_ILT2P', 'travaille_autre_commune'),
    ('ACTOCC15P_ILT2', 'travaille_autre_commune_meme_dept'),
    ('ACTOCC15P_ILT3', 'travaille_autre_dept_meme_region'),
    ('ACTOCC15P_ILT4', 'travaille_autre_region'),
    ('ACTOCC15P_ILT5', 'travaille_hors_metropole'),
    ('ACTOCC15P_PASTRANS', 'transport_aucun'),
    ('ACTOCC15P_MARCHE', 'transport_marche'),
    ('ACTOCC15P_VELO', 'transport_velo'),
    ('ACTOCC15P_2ROUESMOT', 'transport_deux_roues_motorise'),
    ('ACTOCC15P_VOITURE', 'transport_voiture'),
    ('ACTOCC15P_COMMUN', 'transport_commun'),
] -%}

{%- set indicators_16_11 = [
    ('ACTOCC15P_ILT1', 'travaille_commune_residence'),
    ('ACTOCC15P_ILT2P', 'travaille_autre_commune'),
    ('ACTOCC15P_ILT2', 'travaille_autre_commune_meme_dept'),
    ('ACTOCC15P_ILT3', 'travaille_autre_dept_meme_region'),
    ('ACTOCC15P_ILT4', 'travaille_autre_region'),
    ('ACTOCC15P_ILT5', 'travaille_hors_metropole'),
    ('ACTOCC15P_PASTRANS', 'transport_aucun'),
    ('ACTOCC15P_MARCHE', 'transport_marche'),
    ('ACTOCC15P_2ROUES', 'transport_deux_roues'),
    ('ACTOCC15P_VOITURE', 'transport_voiture'),
    ('ACTOCC15P_COMMUN', 'transport_commun'),
] -%}

{%- set columns = [] -%}

{%- for var_code, var_name in indicators_22 -%}
{%- do columns.append(("P22_" ~ var_code, var_name ~ "_22")) -%}
{%- endfor -%}

{%- for year in ['16', '11'] -%}
{%- for var_code, var_name in indicators_16_11 -%}
{%- do columns.append(("P" ~ year ~ "_" ~ var_code, var_name ~ "_" ~ year)) -%}
{%- endfor -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in columns %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
WHERE variable LIKE 'P%'
GROUP BY codgeo
