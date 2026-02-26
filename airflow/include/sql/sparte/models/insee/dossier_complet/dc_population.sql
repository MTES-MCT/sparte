{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Population totale et par tranche d'âge #}
{%- set years = ['22', '16', '11'] -%}
{%- set indicators = [
    ('POP', 'population'),
    ('POP0014', 'pop_0_14'),
    ('POP1529', 'pop_15_29'),
    ('POP3044', 'pop_30_44'),
    ('POP4559', 'pop_45_59'),
    ('POP6074', 'pop_60_74'),
    ('POP7589', 'pop_75_89'),
    ('POP90P', 'pop_90_plus'),
    ('POPH', 'pop_hommes'),
    ('POPF', 'pop_femmes'),
    ('H0019', 'pop_hommes_0_19'),
    ('H2064', 'pop_hommes_20_64'),
    ('H65P', 'pop_hommes_65_plus'),
    ('F0019', 'pop_femmes_0_19'),
    ('F2064', 'pop_femmes_20_64'),
    ('F65P', 'pop_femmes_65_plus'),
] -%}

{%- set columns = [] -%}
{%- for year in years -%}
{%- for var_code, var_name in indicators -%}
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
