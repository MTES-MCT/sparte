{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Emplois au lieu de travail : par CSP, secteur, sexe, statut salarié #}
{%- set years = ['22', '16', '11'] -%}

{# Indicateurs P (principal) #}
{%- set p_indicators = [
    ('EMPLT', 'emplois'),
    ('EMPLT_SAL', 'emplois_salaries'),
    ('EMPLT_FSAL', 'emplois_salaries_femmes'),
    ('EMPLT_SALTP', 'emplois_salaries_temps_partiel'),
    ('EMPLT_NSAL', 'emplois_non_salaries'),
    ('EMPLT_FNSAL', 'emplois_non_salaries_femmes'),
    ('EMPLT_NSALTP', 'emplois_non_salaries_temps_partiel'),
] -%}

{# Indicateurs C22 (complémentaire, nomenclature GS) #}
{%- set c22_indicators = [
    ('EMPLT', 'emplois'),
    ('EMPLT_GS1', 'emplois_agriculteurs'),
    ('EMPLT_GS2', 'emplois_artisans_commercants'),
    ('EMPLT_GS3', 'emplois_cadres'),
    ('EMPLT_GS4', 'emplois_prof_intermediaires'),
    ('EMPLT_GS5', 'emplois_employes'),
    ('EMPLT_GS6', 'emplois_ouvriers'),
    ('EMPLT_AGRI', 'emplois_agriculture'),
    ('EMPLT_INDUS', 'emplois_industrie'),
    ('EMPLT_CONST', 'emplois_construction'),
    ('EMPLT_CTS', 'emplois_commerce_transports_services'),
    ('EMPLT_APESAS', 'emplois_admin_enseignement_sante'),
    ('EMPLT_F', 'emplois_femmes'),
    ('AGRILT_F', 'emplois_agriculture_femmes'),
    ('INDUSLT_F', 'emplois_industrie_femmes'),
    ('CONSTLT_F', 'emplois_construction_femmes'),
    ('CTSLT_F', 'emplois_commerce_transports_services_femmes'),
    ('APESASLT_F', 'emplois_admin_enseignement_sante_femmes'),
    ('EMPLT_SAL', 'emplois_salaries'),
    ('AGRILT_SAL', 'emplois_agriculture_salaries'),
    ('INDUSLT_SAL', 'emplois_industrie_salaries'),
    ('CONSTLT_SAL', 'emplois_construction_salaries'),
    ('CTSLT_SAL', 'emplois_commerce_transports_services_salaries'),
    ('APESASLT_SAL', 'emplois_admin_enseignement_sante_salaries'),
    ('AGRILT_FSAL', 'emplois_agriculture_salaries_femmes'),
    ('INDUSLT_FSAL', 'emplois_industrie_salaries_femmes'),
    ('CONSTLT_FSAL', 'emplois_construction_salaries_femmes'),
    ('CTSLT_FSAL', 'emplois_commerce_transports_services_salaries_femmes'),
    ('APESASLT_FSAL', 'emplois_admin_enseignement_sante_salaries_femmes'),
    ('AGRILT_NSAL', 'emplois_agriculture_non_salaries'),
    ('INDUSLT_NSAL', 'emplois_industrie_non_salaries'),
    ('CONSTLT_NSAL', 'emplois_construction_non_salaries'),
    ('CTSLT_NSAL', 'emplois_commerce_transports_services_non_salaries'),
    ('APESASLT_NSAL', 'emplois_admin_enseignement_sante_non_salaries'),
    ('AGRILT_FNSAL', 'emplois_agriculture_non_salaries_femmes'),
    ('INDUSLT_FNSAL', 'emplois_industrie_non_salaries_femmes'),
    ('CONSTLT_FNSAL', 'emplois_construction_non_salaries_femmes'),
    ('CTSLT_FNSAL', 'emplois_commerce_transports_services_non_salaries_femmes'),
    ('APESASLT_FNSAL', 'emplois_admin_enseignement_sante_non_salaries_femmes'),
] -%}

{# Indicateurs C16/C11 (nomenclature CS) #}
{%- set c16_11_indicators = [
    ('EMPLT', 'emplois'),
    ('EMPLT_CS1', 'emplois_agriculteurs'),
    ('EMPLT_CS2', 'emplois_artisans_commercants'),
    ('EMPLT_CS3', 'emplois_cadres'),
    ('EMPLT_CS4', 'emplois_prof_intermediaires'),
    ('EMPLT_CS5', 'emplois_employes'),
    ('EMPLT_CS6', 'emplois_ouvriers'),
    ('EMPLT_AGRI', 'emplois_agriculture'),
    ('EMPLT_INDUS', 'emplois_industrie'),
    ('EMPLT_CONST', 'emplois_construction'),
    ('EMPLT_CTS', 'emplois_commerce_transports_services'),
    ('EMPLT_APESAS', 'emplois_admin_enseignement_sante'),
    ('EMPLT_F', 'emplois_femmes'),
    ('AGRILT_F', 'emplois_agriculture_femmes'),
    ('INDUSLT_F', 'emplois_industrie_femmes'),
    ('CONSTLT_F', 'emplois_construction_femmes'),
    ('CTSLT_F', 'emplois_commerce_transports_services_femmes'),
    ('APESASLT_F', 'emplois_admin_enseignement_sante_femmes'),
    ('EMPLT_SAL', 'emplois_salaries'),
    ('AGRILT_SAL', 'emplois_agriculture_salaries'),
    ('INDUSLT_SAL', 'emplois_industrie_salaries'),
    ('CONSTLT_SAL', 'emplois_construction_salaries'),
    ('CTSLT_SAL', 'emplois_commerce_transports_services_salaries'),
    ('APESASLT_SAL', 'emplois_admin_enseignement_sante_salaries'),
    ('AGRILT_FSAL', 'emplois_agriculture_salaries_femmes'),
    ('INDUSLT_FSAL', 'emplois_industrie_salaries_femmes'),
    ('CONSTLT_FSAL', 'emplois_construction_salaries_femmes'),
    ('CTSLT_FSAL', 'emplois_commerce_transports_services_salaries_femmes'),
    ('APESASLT_FSAL', 'emplois_admin_enseignement_sante_salaries_femmes'),
    ('AGRILT_NSAL', 'emplois_agriculture_non_salaries'),
    ('INDUSLT_NSAL', 'emplois_industrie_non_salaries'),
    ('CONSTLT_NSAL', 'emplois_construction_non_salaries'),
    ('CTSLT_NSAL', 'emplois_commerce_transports_services_non_salaries'),
    ('APESASLT_NSAL', 'emplois_admin_enseignement_sante_non_salaries'),
    ('AGRILT_FNSAL', 'emplois_agriculture_non_salaries_femmes'),
    ('INDUSLT_FNSAL', 'emplois_industrie_non_salaries_femmes'),
    ('CONSTLT_FNSAL', 'emplois_construction_non_salaries_femmes'),
    ('CTSLT_FNSAL', 'emplois_commerce_transports_services_non_salaries_femmes'),
    ('APESASLT_FNSAL', 'emplois_admin_enseignement_sante_non_salaries_femmes'),
] -%}

{%- set columns = [] -%}

{# P indicateurs #}
{%- for year in years -%}
{%- for var_code, var_name in p_indicators -%}
{%- do columns.append(("P" ~ year ~ "_" ~ var_code, var_name ~ "_" ~ year)) -%}
{%- endfor -%}
{%- endfor -%}

{# C22 #}
{%- for var_code, var_name in c22_indicators -%}
{%- do columns.append(("C22_" ~ var_code, "c_" ~ var_name ~ "_22")) -%}
{%- endfor -%}

{# C16, C11 #}
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
