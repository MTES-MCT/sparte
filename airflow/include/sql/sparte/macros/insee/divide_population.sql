{% macro divide_population(initial_commune_code, final_commune_code, percent) %}
{{
    config(
        materialized='table',
        indexes=[{'columns': ['code_commune'], 'type': 'btree'}]
    )
}}


-- TODO
