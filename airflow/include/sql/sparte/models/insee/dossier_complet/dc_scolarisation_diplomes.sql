{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Scolarisation et diplômes #}

{# Scolarisation : commun à toutes les années #}
{%- set scol_indicators = [
    ('POP0205', 'pop_2_5'),
    ('POP0610', 'pop_6_10'),
    ('POP1114', 'pop_11_14'),
    ('POP1517', 'pop_15_17'),
    ('POP1824', 'pop_18_24'),
    ('POP2529', 'pop_25_29'),
    ('POP30P', 'pop_30_plus'),
    ('SCOL0205', 'scol_2_5'),
    ('SCOL0610', 'scol_6_10'),
    ('SCOL1114', 'scol_11_14'),
    ('SCOL1517', 'scol_15_17'),
    ('SCOL1824', 'scol_18_24'),
    ('SCOL2529', 'scol_25_29'),
    ('SCOL30P', 'scol_30_plus'),
] -%}

{# Diplômes P22 : nomenclature détaillée #}
{%- set dipl_indicators_22 = [
    ('NSCOL15P', 'non_scol_15_plus'),
    ('NSCOL15P_DIPLMIN', 'non_scol_sans_diplome'),
    ('NSCOL15P_BEPC', 'non_scol_bepc'),
    ('NSCOL15P_CAPBEP', 'non_scol_cap_bep'),
    ('NSCOL15P_BAC', 'non_scol_bac'),
    ('NSCOL15P_SUP2', 'non_scol_bac_plus_2'),
    ('NSCOL15P_SUP34', 'non_scol_bac_plus_3_4'),
    ('NSCOL15P_SUP5', 'non_scol_bac_plus_5'),
    ('HNSCOL15P', 'hommes_non_scol_15_plus'),
    ('HNSCOL15P_DIPLMIN', 'hommes_non_scol_sans_diplome'),
    ('HNSCOL15P_BEPC', 'hommes_non_scol_bepc'),
    ('HNSCOL15P_CAPBEP', 'hommes_non_scol_cap_bep'),
    ('HNSCOL15P_BAC', 'hommes_non_scol_bac'),
    ('HNSCOL15P_SUP2', 'hommes_non_scol_bac_plus_2'),
    ('HNSCOL15P_SUP34', 'hommes_non_scol_bac_plus_3_4'),
    ('HNSCOL15P_SUP5', 'hommes_non_scol_bac_plus_5'),
    ('FNSCOL15P', 'femmes_non_scol_15_plus'),
    ('FNSCOL15P_DIPLMIN', 'femmes_non_scol_sans_diplome'),
    ('FNSCOL15P_BEPC', 'femmes_non_scol_bepc'),
    ('FNSCOL15P_CAPBEP', 'femmes_non_scol_cap_bep'),
    ('FNSCOL15P_BAC', 'femmes_non_scol_bac'),
    ('FNSCOL15P_SUP2', 'femmes_non_scol_bac_plus_2'),
    ('FNSCOL15P_SUP34', 'femmes_non_scol_bac_plus_3_4'),
    ('FNSCOL15P_SUP5', 'femmes_non_scol_bac_plus_5'),
] -%}

{# Diplômes P16 : nomenclature simplifiée #}
{%- set dipl_indicators_16 = [
    ('NSCOL15P', 'non_scol_15_plus'),
    ('NSCOL15P_DIPLMIN', 'non_scol_sans_diplome'),
    ('NSCOL15P_CAPBEP', 'non_scol_cap_bep'),
    ('NSCOL15P_BAC', 'non_scol_bac'),
    ('NSCOL15P_SUP', 'non_scol_sup'),
    ('HNSCOL15P', 'hommes_non_scol_15_plus'),
    ('HNSCOL15P_DIPLMIN', 'hommes_non_scol_sans_diplome'),
    ('HNSCOL15P_CAPBEP', 'hommes_non_scol_cap_bep'),
    ('HNSCOL15P_BAC', 'hommes_non_scol_bac'),
    ('HNSCOL15P_SUP', 'hommes_non_scol_sup'),
    ('FNSCOL15P', 'femmes_non_scol_15_plus'),
    ('FNSCOL15P_DIPLMIN', 'femmes_non_scol_sans_diplome'),
    ('FNSCOL15P_CAPBEP', 'femmes_non_scol_cap_bep'),
    ('FNSCOL15P_BAC', 'femmes_non_scol_bac'),
    ('FNSCOL15P_SUP', 'femmes_non_scol_sup'),
] -%}

{# Diplômes P11 : nomenclature ancienne #}
{%- set dipl_indicators_11 = [
    ('NSCOL15P', 'non_scol_15_plus'),
    ('NSCOL15P_DIPL0', 'non_scol_aucun_diplome'),
    ('NSCOL15P_CEP', 'non_scol_cep'),
    ('NSCOL15P_BEPC', 'non_scol_bepc'),
    ('NSCOL15P_CAPBEP', 'non_scol_cap_bep'),
    ('NSCOL15P_BAC', 'non_scol_bac'),
    ('NSCOL15P_BACP2', 'non_scol_bac_plus_2'),
    ('NSCOL15P_SUP', 'non_scol_sup'),
    ('HNSCOL15P', 'hommes_non_scol_15_plus'),
    ('HNSCOL15P_DIPL0', 'hommes_non_scol_aucun_diplome'),
    ('HNSCOL15P_CEP', 'hommes_non_scol_cep'),
    ('HNSCOL15P_BEPC', 'hommes_non_scol_bepc'),
    ('HNSCOL15P_CAPBEP', 'hommes_non_scol_cap_bep'),
    ('HNSCOL15P_BAC', 'hommes_non_scol_bac'),
    ('HNSCOL15P_BACP2', 'hommes_non_scol_bac_plus_2'),
    ('HNSCOL15P_SUP', 'hommes_non_scol_sup'),
    ('FNSCOL15P', 'femmes_non_scol_15_plus'),
    ('FNSCOL15P_DIPL0', 'femmes_non_scol_aucun_diplome'),
    ('FNSCOL15P_CEP', 'femmes_non_scol_cep'),
    ('FNSCOL15P_BEPC', 'femmes_non_scol_bepc'),
    ('FNSCOL15P_CAPBEP', 'femmes_non_scol_cap_bep'),
    ('FNSCOL15P_BAC', 'femmes_non_scol_bac'),
    ('FNSCOL15P_BACP2', 'femmes_non_scol_bac_plus_2'),
    ('FNSCOL15P_SUP', 'femmes_non_scol_sup'),
] -%}

{%- set columns = [] -%}

{# Scolarisation : P22, P16, P11 #}
{%- for year in ['22', '16', '11'] -%}
{%- for var_code, var_name in scol_indicators -%}
{%- do columns.append(("P" ~ year ~ "_" ~ var_code, var_name ~ "_" ~ year)) -%}
{%- endfor -%}
{%- endfor -%}

{# Diplômes P22 #}
{%- for var_code, var_name in dipl_indicators_22 -%}
{%- do columns.append(("P22_" ~ var_code, var_name ~ "_22")) -%}
{%- endfor -%}

{# Diplômes P16 #}
{%- for var_code, var_name in dipl_indicators_16 -%}
{%- do columns.append(("P16_" ~ var_code, var_name ~ "_16")) -%}
{%- endfor -%}

{# Diplômes P11 #}
{%- for var_code, var_name in dipl_indicators_11 -%}
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
