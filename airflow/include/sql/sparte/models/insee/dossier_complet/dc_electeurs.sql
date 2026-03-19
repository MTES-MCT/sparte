{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Électeurs inscrits sur la liste électorale principale #}

{%- set indicators = [
    ('ELECTEURSLP2020', 'electeurs_2020'),
    ('ELECTEURSLP2021', 'electeurs_2021'),
    ('ELECTEURSLP2022', 'electeurs_2022'),
    ('ELECTEURSLP2024', 'electeurs_2024'),
] -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in indicators %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
