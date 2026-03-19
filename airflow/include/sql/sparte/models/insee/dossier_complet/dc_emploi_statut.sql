{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Emploi : statut salarié/non-salarié, type de contrat, temps partiel #}
{%- set years = ['22', '16', '11'] -%}

{%- set indicators_common = [
    ('ACTOCC15P', 'actifs_occupes_15_plus'),
    ('SAL15P', 'salaries_15_plus'),
    ('NSAL15P', 'non_salaries_15_plus'),
    ('ACTOCC15P_TP', 'actifs_occupes_temps_partiel'),
    ('SAL15P_TP', 'salaries_temps_partiel'),
    ('HSAL15P_TP', 'hommes_salaries_temps_partiel'),
    ('FSAL15P_TP', 'femmes_salaries_temps_partiel'),
    ('NSAL15P_TP', 'non_salaries_temps_partiel'),
    ('HACTOCC15P', 'hommes_actifs_occupes'),
    ('FACTOCC15P', 'femmes_actifs_occupes'),
    ('HSAL15P', 'hommes_salaries'),
    ('FSAL15P', 'femmes_salaries'),
    ('HSAL15P_CDI', 'hommes_salaries_cdi'),
    ('HSAL15P_CDD', 'hommes_salaries_cdd'),
    ('HSAL15P_INTERIM', 'hommes_salaries_interim'),
    ('HSAL15P_EMPAID', 'hommes_salaries_emplois_aides'),
    ('HSAL15P_APPR', 'hommes_salaries_apprentissage'),
    ('FSAL15P_CDI', 'femmes_salaries_cdi'),
    ('FSAL15P_CDD', 'femmes_salaries_cdd'),
    ('FSAL15P_INTERIM', 'femmes_salaries_interim'),
    ('FSAL15P_EMPAID', 'femmes_salaries_emplois_aides'),
    ('FSAL15P_APPR', 'femmes_salaries_apprentissage'),
    ('HNSAL15P', 'hommes_non_salaries'),
    ('HNSAL15P_INDEP', 'hommes_non_salaries_independants'),
    ('HNSAL15P_EMPLOY', 'hommes_non_salaries_employeurs'),
    ('HNSAL15P_AIDFAM', 'hommes_non_salaries_aide_familiale'),
    ('FNSAL15P', 'femmes_non_salaries'),
    ('FNSAL15P_INDEP', 'femmes_non_salaries_independantes'),
    ('FNSAL15P_EMPLOY', 'femmes_non_salaries_employeurs'),
    ('FNSAL15P_AIDFAM', 'femmes_non_salaries_aide_familiale'),
    ('HSAL1564', 'hommes_salaries_15_64'),
    ('HSAL1524', 'hommes_salaries_15_24'),
    ('HSAL2554', 'hommes_salaries_25_54'),
    ('HSAL5564', 'hommes_salaries_55_64'),
    ('HSAL1564_TP', 'hommes_salaries_15_64_temps_partiel'),
    ('HSAL1524_TP', 'hommes_salaries_15_24_temps_partiel'),
    ('HSAL2554_TP', 'hommes_salaries_25_54_temps_partiel'),
    ('HSAL5564_TP', 'hommes_salaries_55_64_temps_partiel'),
    ('FSAL1564', 'femmes_salaries_15_64'),
    ('FSAL1524', 'femmes_salaries_15_24'),
    ('FSAL2554', 'femmes_salaries_25_54'),
    ('FSAL5564', 'femmes_salaries_55_64'),
    ('FSAL1564_TP', 'femmes_salaries_15_64_temps_partiel'),
    ('FSAL1524_TP', 'femmes_salaries_15_24_temps_partiel'),
    ('FSAL2554_TP', 'femmes_salaries_25_54_temps_partiel'),
    ('FSAL5564_TP', 'femmes_salaries_55_64_temps_partiel'),
] -%}

{%- set columns = [] -%}
{%- for year in years -%}
{%- for var_code, var_name in indicators_common -%}
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
