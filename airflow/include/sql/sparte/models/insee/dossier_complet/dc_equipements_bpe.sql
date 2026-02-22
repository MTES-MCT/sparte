{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Équipements et services : Base Permanente des Équipements 2024 #}

{%- set indicators = [
    ('BPE_2024_A501', 'coiffure'),
    ('BPE_2024_B104', 'hypermarche'),
    ('BPE_2024_B105', 'supermarche'),
    ('BPE_2024_B201', 'superette'),
    ('BPE_2024_B202', 'epicerie'),
    ('BPE_2024_B207', 'boulangerie'),
    ('BPE_2024_B316', 'station_service'),
    ('BPE_2024_B326', 'borne_recharge_electrique'),
    ('BPE_2024_C107', 'ecole_maternelle'),
    ('BPE_2024_C108', 'ecole_primaire'),
    ('BPE_2024_C109', 'ecole_elementaire'),
    ('BPE_2024_C201', 'college'),
    ('BPE_2024_C301', 'lycee_general_technologique'),
    ('BPE_2024_C302', 'lycee_professionnel'),
    ('BPE_2024_C303', 'lycee_agricole'),
    ('BPE_2024_C304', 'enseignement_gen_tech_lycee_pro'),
    ('BPE_2024_C305', 'enseignement_pro_lycee_gen_tech'),
    ('BPE_2024_D265', 'medecin_generaliste'),
    ('BPE_2024_D277', 'chirurgien_dentiste'),
    ('BPE_2024_D279', 'masseur_kinesitherapeute'),
    ('BPE_2024_D281', 'infirmier'),
    ('BPE_2024_D250', 'psychologue'),
] -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in indicators %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
