{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Activité, chômage, inactivité : pop 15-64 par statut d'activité #}

{# Indicateurs communs P22, P16, P11 #}
{%- set p_common = [
    ('POP1564', 'pop_15_64'),
    ('H1564', 'hommes_15_64'),
    ('H1524', 'hommes_15_24'),
    ('H2554', 'hommes_25_54'),
    ('H5564', 'hommes_55_64'),
    ('F1564', 'femmes_15_64'),
    ('F1524', 'femmes_15_24'),
    ('F2554', 'femmes_25_54'),
    ('F5564', 'femmes_55_64'),
    ('ACT1564', 'actifs_15_64'),
    ('ACT1524', 'actifs_15_24'),
    ('ACT2554', 'actifs_25_54'),
    ('ACT5564', 'actifs_55_64'),
    ('HACT1564', 'hommes_actifs_15_64'),
    ('HACT1524', 'hommes_actifs_15_24'),
    ('HACT2554', 'hommes_actifs_25_54'),
    ('HACT5564', 'hommes_actifs_55_64'),
    ('FACT1564', 'femmes_actifs_15_64'),
    ('FACT1524', 'femmes_actifs_15_24'),
    ('FACT2554', 'femmes_actifs_25_54'),
    ('FACT5564', 'femmes_actifs_55_64'),
    ('ACTOCC1564', 'actifs_occupes_15_64'),
    ('ACTOCC1524', 'actifs_occupes_15_24'),
    ('ACTOCC2554', 'actifs_occupes_25_54'),
    ('ACTOCC5564', 'actifs_occupes_55_64'),
    ('HACTOCC1564', 'hommes_actifs_occupes_15_64'),
    ('HACTOCC1524', 'hommes_actifs_occupes_15_24'),
    ('HACTOCC2554', 'hommes_actifs_occupes_25_54'),
    ('HACTOCC5564', 'hommes_actifs_occupes_55_64'),
    ('FACTOCC1564', 'femmes_actifs_occupes_15_64'),
    ('FACTOCC1524', 'femmes_actifs_occupes_15_24'),
    ('FACTOCC2554', 'femmes_actifs_occupes_25_54'),
    ('FACTOCC5564', 'femmes_actifs_occupes_55_64'),
    ('CHOM1564', 'chomeurs_15_64'),
    ('INACT1564', 'inactifs_15_64'),
    ('ETUD1564', 'etudiants_15_64'),
    ('RETR1564', 'retraites_15_64'),
    ('AINACT1564', 'autres_inactifs_15_64'),
] -%}

{# POP1524/POP2554 existent en P22 et P16, pas en P11 #}
{%- set p_22_16_only = [
    ('POP1524', 'pop_15_24'),
    ('POP2554', 'pop_25_54'),
] -%}

{# Chômage par âge détaillé + par sexe : P22 uniquement #}
{%- set p22_chom_detail = [
    ('CHOM1524', 'chomeurs_15_24'),
    ('CHOM2554', 'chomeurs_25_54'),
    ('CHOM5564', 'chomeurs_55_64'),
    ('HCHOM1564', 'hommes_chomeurs_15_64'),
    ('HCHOM1524', 'hommes_chomeurs_15_24'),
    ('HCHOM2554', 'hommes_chomeurs_25_54'),
    ('HCHOM5564', 'hommes_chomeurs_55_64'),
    ('FCHOM1564', 'femmes_chomeurs_15_64'),
    ('FCHOM1524', 'femmes_chomeurs_15_24'),
    ('FCHOM2554', 'femmes_chomeurs_25_54'),
    ('FCHOM5564', 'femmes_chomeurs_55_64'),
] -%}

{# Chômage par diplôme : P22 uniquement #}
{%- set p22_dipl_indicators = [
    ('CHOM_DIPLMIN', 'chomeurs_sans_diplome'),
    ('CHOM_BEPC', 'chomeurs_bepc'),
    ('CHOM_CAPBEP', 'chomeurs_cap_bep'),
    ('CHOM_BAC', 'chomeurs_bac'),
    ('CHOM_SUP2', 'chomeurs_bac_plus_2'),
    ('CHOM_SUP34', 'chomeurs_bac_plus_3_4'),
    ('CHOM_SUP5', 'chomeurs_bac_plus_5'),
    ('ACT_DIPLMIN', 'actifs_sans_diplome'),
    ('ACT_BEPC', 'actifs_bepc'),
    ('ACT_CAPBEP', 'actifs_cap_bep'),
    ('ACT_BAC', 'actifs_bac'),
    ('ACT_SUP2', 'actifs_bac_plus_2'),
    ('ACT_SUP34', 'actifs_bac_plus_3_4'),
    ('ACT_SUP5', 'actifs_bac_plus_5'),
] -%}

{# Activité par CSP C22 : ACTOCC1564 utilise GSEC simple (pas de double suffixe) #}
{%- set c22_indicators = [
    ('ACT1564', 'actifs_15_64'),
    ('ACT1564_STAT_GSEC11_21', 'actifs_15_64_agriculteurs'),
    ('ACT1564_STAT_GSEC12_22', 'actifs_15_64_artisans_commercants'),
    ('ACT1564_STAT_GSEC13_23', 'actifs_15_64_cadres'),
    ('ACT1564_STAT_GSEC14_24', 'actifs_15_64_prof_intermediaires'),
    ('ACT1564_STAT_GSEC15_25', 'actifs_15_64_employes'),
    ('ACT1564_STAT_GSEC16_26', 'actifs_15_64_ouvriers'),
    ('ACTOCC1564', 'actifs_occupes_15_64'),
    ('ACTOCC1564_STAT_GSEC11', 'actifs_occupes_15_64_agriculteurs'),
    ('ACTOCC1564_STAT_GSEC12', 'actifs_occupes_15_64_artisans_commercants'),
    ('ACTOCC1564_STAT_GSEC13', 'actifs_occupes_15_64_cadres'),
    ('ACTOCC1564_STAT_GSEC14', 'actifs_occupes_15_64_prof_intermediaires'),
    ('ACTOCC1564_STAT_GSEC15', 'actifs_occupes_15_64_employes'),
    ('ACTOCC1564_STAT_GSEC16', 'actifs_occupes_15_64_ouvriers'),
] -%}

{%- set c16_11_indicators = [
    ('ACT1564', 'actifs_15_64'),
    ('ACT1564_CS1', 'actifs_15_64_agriculteurs'),
    ('ACT1564_CS2', 'actifs_15_64_artisans_commercants'),
    ('ACT1564_CS3', 'actifs_15_64_cadres'),
    ('ACT1564_CS4', 'actifs_15_64_prof_intermediaires'),
    ('ACT1564_CS5', 'actifs_15_64_employes'),
    ('ACT1564_CS6', 'actifs_15_64_ouvriers'),
    ('ACTOCC1564', 'actifs_occupes_15_64'),
    ('ACTOCC1564_CS1', 'actifs_occupes_15_64_agriculteurs'),
    ('ACTOCC1564_CS2', 'actifs_occupes_15_64_artisans_commercants'),
    ('ACTOCC1564_CS3', 'actifs_occupes_15_64_cadres'),
    ('ACTOCC1564_CS4', 'actifs_occupes_15_64_prof_intermediaires'),
    ('ACTOCC1564_CS5', 'actifs_occupes_15_64_employes'),
    ('ACTOCC1564_CS6', 'actifs_occupes_15_64_ouvriers'),
] -%}

{%- set columns = [] -%}

{# P communs : 22, 16, 11 #}
{%- for year in ['22', '16', '11'] -%}
{%- for var_code, var_name in p_common -%}
{%- do columns.append(("P" ~ year ~ "_" ~ var_code, var_name ~ "_" ~ year)) -%}
{%- endfor -%}
{%- endfor -%}

{# POP1524/POP2554 : P22 et P16 seulement #}
{%- for year in ['22', '16'] -%}
{%- for var_code, var_name in p_22_16_only -%}
{%- do columns.append(("P" ~ year ~ "_" ~ var_code, var_name ~ "_" ~ year)) -%}
{%- endfor -%}
{%- endfor -%}

{# Chômage détaillé P22 #}
{%- for var_code, var_name in p22_chom_detail -%}
{%- do columns.append(("P22_" ~ var_code, var_name ~ "_22")) -%}
{%- endfor -%}

{# Chômage par diplôme P22 #}
{%- for var_code, var_name in p22_dipl_indicators -%}
{%- do columns.append(("P22_" ~ var_code, var_name ~ "_22")) -%}
{%- endfor -%}

{# CSP complémentaire C22 #}
{%- for var_code, var_name in c22_indicators -%}
{%- do columns.append(("C22_" ~ var_code, "c_" ~ var_name ~ "_22")) -%}
{%- endfor -%}

{# CSP complémentaire C16, C11 #}
{%- for year in ['16', '11'] -%}
{%- for var_code, var_name in c16_11_indicators -%}
{%- do columns.append(("C" ~ year ~ "_" ~ var_code, "c_" ~ var_name ~ "_" ~ year)) -%}
{%- endfor -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in columns %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
