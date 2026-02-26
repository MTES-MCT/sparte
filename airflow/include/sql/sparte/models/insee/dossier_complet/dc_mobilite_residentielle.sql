{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Mobilité résidentielle : lieu de résidence 1 an auparavant #}
{%- set years = ['22', '16', '11'] -%}
{%- set indicators = [
    ('POP01P', 'pop_1an_plus'),
    ('POP01P_IRAN1', 'pop_meme_logement'),
    ('POP01P_IRAN2', 'pop_autre_logement_meme_commune'),
    ('POP01P_IRAN3', 'pop_autre_commune_meme_dept'),
    ('POP01P_IRAN4', 'pop_autre_dept_meme_region'),
    ('POP01P_IRAN5', 'pop_autre_region_metropole'),
    ('POP01P_IRAN6', 'pop_dom'),
    ('POP01P_IRAN7', 'pop_hors_metro_dom'),
    ('POP0114_IRAN2P', 'pop_0_14_autre_logement'),
    ('POP0114_IRAN2', 'pop_0_14_autre_logt_meme_commune'),
    ('POP0114_IRAN3P', 'pop_0_14_autre_commune'),
    ('POP1524_IRAN2P', 'pop_15_24_autre_logement'),
    ('POP1524_IRAN2', 'pop_15_24_autre_logt_meme_commune'),
    ('POP1524_IRAN3P', 'pop_15_24_autre_commune'),
    ('POP2554_IRAN2P', 'pop_25_54_autre_logement'),
    ('POP2554_IRAN2', 'pop_25_54_autre_logt_meme_commune'),
    ('POP2554_IRAN3P', 'pop_25_54_autre_commune'),
    ('POP55P_IRAN2P', 'pop_55_plus_autre_logement'),
    ('POP55P_IRAN2', 'pop_55_plus_autre_logt_meme_commune'),
    ('POP55P_IRAN3P', 'pop_55_plus_autre_commune'),
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
