{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Salaires nets : salaire net mensuel moyen EQTP par sexe, âge, CSP #}

{%- set indicators = [
    ('SNEMM_23', 'salaire_net_moyen'),
    ('SNEMM_SEX_F_23', 'salaire_net_moyen_femmes'),
    ('SNEMM_SEX_M_23', 'salaire_net_moyen_hommes'),
    ('SNEMM_AGE_Y_LT25_23', 'salaire_net_moyen_moins_25'),
    ('SNEMM_AGE_Y25T39_23', 'salaire_net_moyen_25_39'),
    ('SNEMM_AGE_Y40T49_23', 'salaire_net_moyen_40_49'),
    ('SNEMM_AGE_Y50T54_23', 'salaire_net_moyen_50_54'),
    ('SNEMM_AGE_Y_GE55_23', 'salaire_net_moyen_55_plus'),
    ('SNEMM_PCS_ESE_1T3_23', 'salaire_net_moyen_cadres'),
    ('SNEMM_PCS_ESE_4_23', 'salaire_net_moyen_prof_intermediaires'),
    ('SNEMM_PCS_ESE_5_23', 'salaire_net_moyen_employes'),
    ('SNEMM_PCS_ESE_6_23', 'salaire_net_moyen_ouvriers'),
    ('SNEMM_SEX_F_AGE_Y_LT25_23', 'salaire_net_moyen_femmes_moins_25'),
    ('SNEMM_SEX_F_AGE_Y25T39_23', 'salaire_net_moyen_femmes_25_39'),
    ('SNEMM_SEX_F_AGE_Y40T49_23', 'salaire_net_moyen_femmes_40_49'),
    ('SNEMM_SEX_F_AGE_Y50T54_23', 'salaire_net_moyen_femmes_50_54'),
    ('SNEMM_SEX_F_AGE_Y_GE55_23', 'salaire_net_moyen_femmes_55_plus'),
    ('SNEMM_SEX_M_AGE_Y_LT25_23', 'salaire_net_moyen_hommes_moins_25'),
    ('SNEMM_SEX_M_AGE_Y25T39_23', 'salaire_net_moyen_hommes_25_39'),
    ('SNEMM_SEX_M_AGE_Y40T49_23', 'salaire_net_moyen_hommes_40_49'),
    ('SNEMM_SEX_M_AGE_Y50T54_23', 'salaire_net_moyen_hommes_50_54'),
    ('SNEMM_SEX_M_AGE_Y_GE55_23', 'salaire_net_moyen_hommes_55_plus'),
    ('SNEMM_SEX_F_PCS_ESE_1T3_23', 'salaire_net_moyen_femmes_cadres'),
    ('SNEMM_SEX_F_PCS_ESE_4_23', 'salaire_net_moyen_femmes_prof_intermediaires'),
    ('SNEMM_SEX_F_PCS_ESE_5_23', 'salaire_net_moyen_femmes_employes'),
    ('SNEMM_SEX_F_PCS_ESE_6_23', 'salaire_net_moyen_femmes_ouvriers'),
    ('SNEMM_SEX_M_PCS_ESE_1T3_23', 'salaire_net_moyen_hommes_cadres'),
    ('SNEMM_SEX_M_PCS_ESE_4_23', 'salaire_net_moyen_hommes_prof_intermediaires'),
    ('SNEMM_SEX_M_PCS_ESE_5_23', 'salaire_net_moyen_hommes_employes'),
    ('SNEMM_SEX_M_PCS_ESE_6_23', 'salaire_net_moyen_hommes_ouvriers'),
] -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in indicators %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
