{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Revenus et pauvreté : ménages fiscaux, niveau de vie, taux de pauvreté #}

{%- set indicators = [
    ('NBMENFISC21', 'nb_menages_fiscaux'),
    ('NBPERSMENFISC21', 'nb_personnes_menages_fiscaux'),
    ('MED21', 'mediane_niveau_vie'),
    ('PIMP21', 'part_menages_imposes'),
    ('TP6021', 'taux_pauvrete'),
    ('TP60AGE121', 'taux_pauvrete_moins_30'),
    ('TP60AGE221', 'taux_pauvrete_30_39'),
    ('TP60AGE321', 'taux_pauvrete_40_49'),
    ('TP60AGE421', 'taux_pauvrete_50_59'),
    ('TP60AGE521', 'taux_pauvrete_60_74'),
    ('TP60AGE621', 'taux_pauvrete_75_plus'),
    ('TP60TOL121', 'taux_pauvrete_proprietaires'),
    ('TP60TOL221', 'taux_pauvrete_locataires'),
    ('PACT21', 'part_revenus_activite'),
    ('PTSA21', 'part_salaires'),
    ('PCHO21', 'part_indemnites_chomage'),
    ('PBEN21', 'part_revenus_non_salaries'),
    ('PPEN21', 'part_pensions_retraites'),
    ('PPAT21', 'part_revenus_patrimoine'),
    ('PPSOC21', 'part_prestations_sociales'),
    ('PPFAM21', 'part_prestations_familiales'),
    ('PPMINI21', 'part_minima_sociaux'),
    ('PPLOGT21', 'part_prestations_logement'),
    ('PIMPOT21', 'part_impots'),
    ('D121', 'decile_1'),
    ('D921', 'decile_9'),
    ('RD21', 'rapport_interdecile'),
] -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in indicators %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
