{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Catégories socioprofessionnelles : pop 15+ par CSP, sexe, âge #}

{# C22 utilise _STAT_GSEC, C16/C11 utilisent _CS #}
{%- set indicators_22 = [
    ('POP15P', 'pop_15_plus'),
    ('POP15P_STAT_GSEC11_21', 'pop_15_plus_agriculteurs'),
    ('POP15P_STAT_GSEC12_22', 'pop_15_plus_artisans_commercants'),
    ('POP15P_STAT_GSEC13_23', 'pop_15_plus_cadres'),
    ('POP15P_STAT_GSEC14_24', 'pop_15_plus_prof_intermediaires'),
    ('POP15P_STAT_GSEC15_25', 'pop_15_plus_employes'),
    ('POP15P_STAT_GSEC16_26', 'pop_15_plus_ouvriers'),
    ('POP15P_STAT_GSEC32', 'pop_15_plus_retraites'),
    ('POP15P_STAT_GSEC40', 'pop_15_plus_autres_inactifs'),
    ('H15P', 'hommes_15_plus'),
    ('H15P_STAT_GSEC11_21', 'hommes_15_plus_agriculteurs'),
    ('H15P_STAT_GSEC12_22', 'hommes_15_plus_artisans_commercants'),
    ('H15P_STAT_GSEC13_23', 'hommes_15_plus_cadres'),
    ('H15P_STAT_GSEC14_24', 'hommes_15_plus_prof_intermediaires'),
    ('H15P_STAT_GSEC15_25', 'hommes_15_plus_employes'),
    ('H15P_STAT_GSEC16_26', 'hommes_15_plus_ouvriers'),
    ('F15P', 'femmes_15_plus'),
    ('F15P_STAT_GSEC11_21', 'femmes_15_plus_agriculteurs'),
    ('F15P_STAT_GSEC12_22', 'femmes_15_plus_artisans_commercants'),
    ('F15P_STAT_GSEC13_23', 'femmes_15_plus_cadres'),
    ('F15P_STAT_GSEC14_24', 'femmes_15_plus_prof_intermediaires'),
    ('F15P_STAT_GSEC15_25', 'femmes_15_plus_employes'),
    ('F15P_STAT_GSEC16_26', 'femmes_15_plus_ouvriers'),
    ('POP1524', 'pop_15_24'),
    ('POP1524_STAT_GSEC11_21', 'pop_15_24_agriculteurs'),
    ('POP1524_STAT_GSEC12_22', 'pop_15_24_artisans_commercants'),
    ('POP1524_STAT_GSEC13_23', 'pop_15_24_cadres'),
    ('POP1524_STAT_GSEC14_24', 'pop_15_24_prof_intermediaires'),
    ('POP1524_STAT_GSEC15_25', 'pop_15_24_employes'),
    ('POP1524_STAT_GSEC16_26', 'pop_15_24_ouvriers'),
    ('POP2554', 'pop_25_54'),
    ('POP2554_STAT_GSEC11_21', 'pop_25_54_agriculteurs'),
    ('POP2554_STAT_GSEC12_22', 'pop_25_54_artisans_commercants'),
    ('POP2554_STAT_GSEC13_23', 'pop_25_54_cadres'),
    ('POP2554_STAT_GSEC14_24', 'pop_25_54_prof_intermediaires'),
    ('POP2554_STAT_GSEC15_25', 'pop_25_54_employes'),
    ('POP2554_STAT_GSEC16_26', 'pop_25_54_ouvriers'),
    ('POP55P', 'pop_55_plus'),
    ('POP55P_STAT_GSEC11_21', 'pop_55_plus_agriculteurs'),
    ('POP55P_STAT_GSEC12_22', 'pop_55_plus_artisans_commercants'),
    ('POP55P_STAT_GSEC13_23', 'pop_55_plus_cadres'),
    ('POP55P_STAT_GSEC14_24', 'pop_55_plus_prof_intermediaires'),
    ('POP55P_STAT_GSEC15_25', 'pop_55_plus_employes'),
    ('POP55P_STAT_GSEC16_26', 'pop_55_plus_ouvriers'),
    ('MEN_STAT_GSEC11_21', 'menages_agriculteurs'),
    ('MEN_STAT_GSEC12_22', 'menages_artisans_commercants'),
    ('MEN_STAT_GSEC13_23', 'menages_cadres'),
    ('MEN_STAT_GSEC14_24', 'menages_prof_intermediaires'),
    ('MEN_STAT_GSEC15_25', 'menages_employes'),
    ('MEN_STAT_GSEC16_26', 'menages_ouvriers'),
    ('PMEN_STAT_GSEC11_21', 'pop_menages_agriculteurs'),
    ('PMEN_STAT_GSEC12_22', 'pop_menages_artisans_commercants'),
    ('PMEN_STAT_GSEC13_23', 'pop_menages_cadres'),
    ('PMEN_STAT_GSEC14_24', 'pop_menages_prof_intermediaires'),
    ('PMEN_STAT_GSEC15_25', 'pop_menages_employes'),
    ('PMEN_STAT_GSEC16_26', 'pop_menages_ouvriers'),
] -%}

{%- set indicators_16_11 = [
    ('POP15P', 'pop_15_plus'),
    ('POP15P_CS1', 'pop_15_plus_agriculteurs'),
    ('POP15P_CS2', 'pop_15_plus_artisans_commercants'),
    ('POP15P_CS3', 'pop_15_plus_cadres'),
    ('POP15P_CS4', 'pop_15_plus_prof_intermediaires'),
    ('POP15P_CS5', 'pop_15_plus_employes'),
    ('POP15P_CS6', 'pop_15_plus_ouvriers'),
    ('H15P', 'hommes_15_plus'),
    ('H15P_CS1', 'hommes_15_plus_agriculteurs'),
    ('H15P_CS2', 'hommes_15_plus_artisans_commercants'),
    ('H15P_CS3', 'hommes_15_plus_cadres'),
    ('H15P_CS4', 'hommes_15_plus_prof_intermediaires'),
    ('H15P_CS5', 'hommes_15_plus_employes'),
    ('H15P_CS6', 'hommes_15_plus_ouvriers'),
    ('F15P', 'femmes_15_plus'),
    ('F15P_CS1', 'femmes_15_plus_agriculteurs'),
    ('F15P_CS2', 'femmes_15_plus_artisans_commercants'),
    ('F15P_CS3', 'femmes_15_plus_cadres'),
    ('F15P_CS4', 'femmes_15_plus_prof_intermediaires'),
    ('F15P_CS5', 'femmes_15_plus_employes'),
    ('F15P_CS6', 'femmes_15_plus_ouvriers'),
    ('POP1524', 'pop_15_24'),
    ('POP1524_CS1', 'pop_15_24_agriculteurs'),
    ('POP1524_CS2', 'pop_15_24_artisans_commercants'),
    ('POP1524_CS3', 'pop_15_24_cadres'),
    ('POP1524_CS4', 'pop_15_24_prof_intermediaires'),
    ('POP1524_CS5', 'pop_15_24_employes'),
    ('POP1524_CS6', 'pop_15_24_ouvriers'),
    ('POP2554', 'pop_25_54'),
    ('POP2554_CS1', 'pop_25_54_agriculteurs'),
    ('POP2554_CS2', 'pop_25_54_artisans_commercants'),
    ('POP2554_CS3', 'pop_25_54_cadres'),
    ('POP2554_CS4', 'pop_25_54_prof_intermediaires'),
    ('POP2554_CS5', 'pop_25_54_employes'),
    ('POP2554_CS6', 'pop_25_54_ouvriers'),
    ('POP55P', 'pop_55_plus'),
    ('POP55P_CS1', 'pop_55_plus_agriculteurs'),
    ('POP55P_CS2', 'pop_55_plus_artisans_commercants'),
    ('POP55P_CS3', 'pop_55_plus_cadres'),
    ('POP55P_CS4', 'pop_55_plus_prof_intermediaires'),
    ('POP55P_CS5', 'pop_55_plus_employes'),
    ('POP55P_CS6', 'pop_55_plus_ouvriers'),
    ('MEN_CS1', 'menages_agriculteurs'),
    ('MEN_CS2', 'menages_artisans_commercants'),
    ('MEN_CS3', 'menages_cadres'),
    ('MEN_CS4', 'menages_prof_intermediaires'),
    ('MEN_CS5', 'menages_employes'),
    ('MEN_CS6', 'menages_ouvriers'),
    ('PMEN_CS1', 'pop_menages_agriculteurs'),
    ('PMEN_CS2', 'pop_menages_artisans_commercants'),
    ('PMEN_CS3', 'pop_menages_cadres'),
    ('PMEN_CS4', 'pop_menages_prof_intermediaires'),
    ('PMEN_CS5', 'pop_menages_employes'),
    ('PMEN_CS6', 'pop_menages_ouvriers'),
] -%}

{%- set columns = [] -%}

{# C22 avec nomenclature STAT_GSEC #}
{%- for var_code, var_name in indicators_22 -%}
{%- do columns.append(("C22_" ~ var_code, var_name ~ "_22")) -%}
{%- endfor -%}

{# C16 et C11 avec nomenclature CS #}
{%- for year in ['16', '11'] -%}
{%- for var_code, var_name in indicators_16_11 -%}
{%- do columns.append(("C" ~ year ~ "_" ~ var_code, var_name ~ "_" ~ year)) -%}
{%- endfor -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in columns %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
WHERE variable LIKE 'C%'
GROUP BY codgeo
