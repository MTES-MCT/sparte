{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Situation conjugale : vie en couple, état matrimonial #}

{# P22 : nomenclature détaillée (MARIEE, PACSEE, etc.) #}
{%- set indicators_22 = [
    ('POP15P', 'pop_15_plus'),
    ('POP1519', 'pop_15_19'),
    ('POP2024', 'pop_20_24'),
    ('POP2539', 'pop_25_39'),
    ('POP4054', 'pop_40_54'),
    ('POP5564', 'pop_55_64'),
    ('POP6579', 'pop_65_79'),
    ('POP80P', 'pop_80_plus'),
    ('POPMEN1519', 'pop_menages_15_19'),
    ('POPMEN2024', 'pop_menages_20_24'),
    ('POPMEN2539', 'pop_menages_25_39'),
    ('POPMEN4054', 'pop_menages_40_54'),
    ('POPMEN5564', 'pop_menages_55_64'),
    ('POPMEN6579', 'pop_menages_65_79'),
    ('POPMEN80P', 'pop_menages_80_plus'),
    ('POP1519_PSEUL', 'pop_15_19_seul'),
    ('POP2024_PSEUL', 'pop_20_24_seul'),
    ('POP2539_PSEUL', 'pop_25_39_seul'),
    ('POP4054_PSEUL', 'pop_40_54_seul'),
    ('POP5564_PSEUL', 'pop_55_64_seul'),
    ('POP6579_PSEUL', 'pop_65_79_seul'),
    ('POP80P_PSEUL', 'pop_80_plus_seul'),
    ('POP1519_COUPLE', 'pop_15_19_couple'),
    ('POP2024_COUPLE', 'pop_20_24_couple'),
    ('POP2539_COUPLE', 'pop_25_39_couple'),
    ('POP4054_COUPLE', 'pop_40_54_couple'),
    ('POP5564_COUPLE', 'pop_55_64_couple'),
    ('POP6579_COUPLE', 'pop_65_79_couple'),
    ('POP80P_COUPLE', 'pop_80_plus_couple'),
    ('POP15P_MARIEE', 'pop_15_plus_maries'),
    ('POP15P_PACSEE', 'pop_15_plus_pacses'),
    ('POP15P_CONCUB_UNION_LIBRE', 'pop_15_plus_concubinage'),
    ('POP15P_VEUFS', 'pop_15_plus_veufs'),
    ('POP15P_DIVORCEE', 'pop_15_plus_divorces'),
    ('POP15P_CELIBATAIRE', 'pop_15_plus_celibataires'),
] -%}

{# P16 : nomenclature simplifiée #}
{%- set indicators_16 = [
    ('POP15P', 'pop_15_plus'),
    ('POP1519', 'pop_15_19'),
    ('POP2024', 'pop_20_24'),
    ('POP2539', 'pop_25_39'),
    ('POP4054', 'pop_40_54'),
    ('POP5564', 'pop_55_64'),
    ('POP6579', 'pop_65_79'),
    ('POP80P', 'pop_80_plus'),
    ('POPMEN1519', 'pop_menages_15_19'),
    ('POPMEN2024', 'pop_menages_20_24'),
    ('POPMEN2539', 'pop_menages_25_39'),
    ('POPMEN4054', 'pop_menages_40_54'),
    ('POPMEN5564', 'pop_menages_55_64'),
    ('POPMEN6579', 'pop_menages_65_79'),
    ('POPMEN80P', 'pop_menages_80_plus'),
    ('POP1519_PSEUL', 'pop_15_19_seul'),
    ('POP2024_PSEUL', 'pop_20_24_seul'),
    ('POP2539_PSEUL', 'pop_25_39_seul'),
    ('POP4054_PSEUL', 'pop_40_54_seul'),
    ('POP5564_PSEUL', 'pop_55_64_seul'),
    ('POP6579_PSEUL', 'pop_65_79_seul'),
    ('POP80P_PSEUL', 'pop_80_plus_seul'),
    ('POP1519_COUPLE', 'pop_15_19_couple'),
    ('POP2024_COUPLE', 'pop_20_24_couple'),
    ('POP2539_COUPLE', 'pop_25_39_couple'),
    ('POP4054_COUPLE', 'pop_40_54_couple'),
    ('POP5564_COUPLE', 'pop_55_64_couple'),
    ('POP6579_COUPLE', 'pop_65_79_couple'),
    ('POP80P_COUPLE', 'pop_80_plus_couple'),
    ('POP15P_MARIEE', 'pop_15_plus_maries'),
    ('POP15P_NONMARIEE', 'pop_15_plus_non_maries'),
] -%}

{# P11 : autre nomenclature #}
{%- set indicators_11 = [
    ('POP15P', 'pop_15_plus'),
    ('POP1519', 'pop_15_19'),
    ('POP2024', 'pop_20_24'),
    ('POP2539', 'pop_25_39'),
    ('POP4054', 'pop_40_54'),
    ('POP5564', 'pop_55_64'),
    ('POP6579', 'pop_65_79'),
    ('POP80P', 'pop_80_plus'),
    ('POPMEN1519', 'pop_menages_15_19'),
    ('POPMEN2024', 'pop_menages_20_24'),
    ('POPMEN2539', 'pop_menages_25_39'),
    ('POPMEN4054', 'pop_menages_40_54'),
    ('POPMEN5564', 'pop_menages_55_64'),
    ('POPMEN6579', 'pop_menages_65_79'),
    ('POPMEN80P', 'pop_menages_80_plus'),
    ('POP1519_PSEUL', 'pop_15_19_seul'),
    ('POP2024_PSEUL', 'pop_20_24_seul'),
    ('POP2539_PSEUL', 'pop_25_39_seul'),
    ('POP4054_PSEUL', 'pop_40_54_seul'),
    ('POP5564_PSEUL', 'pop_55_64_seul'),
    ('POP6579_PSEUL', 'pop_65_79_seul'),
    ('POP80P_PSEUL', 'pop_80_plus_seul'),
    ('POP1519_COUPLE', 'pop_15_19_couple'),
    ('POP2024_COUPLE', 'pop_20_24_couple'),
    ('POP2539_COUPLE', 'pop_25_39_couple'),
    ('POP4054_COUPLE', 'pop_40_54_couple'),
    ('POP5564_COUPLE', 'pop_55_64_couple'),
    ('POP6579_COUPLE', 'pop_65_79_couple'),
    ('POP80P_COUPLE', 'pop_80_plus_couple'),
    ('POP15P_MARIE', 'pop_15_plus_maries'),
    ('POP15P_CELIB', 'pop_15_plus_celibataires'),
    ('POP15P_VEUF', 'pop_15_plus_veufs'),
    ('POP15P_DIVOR', 'pop_15_plus_divorces'),
] -%}

{%- set columns = [] -%}

{%- for var_code, var_name in indicators_22 -%}
{%- do columns.append(("P22_" ~ var_code, var_name ~ "_22")) -%}
{%- endfor -%}

{%- for var_code, var_name in indicators_16 -%}
{%- do columns.append(("P16_" ~ var_code, var_name ~ "_16")) -%}
{%- endfor -%}

{%- for var_code, var_name in indicators_11 -%}
{%- do columns.append(("P11_" ~ var_code, var_name ~ "_11")) -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in columns %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
WHERE variable LIKE 'P%'
GROUP BY codgeo
