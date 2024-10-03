{% macro epci(source_table_name) %}
    {{ config(materialized='table') }}

    SELECT
        id,
        nom as name,
        code_siren as code,
        nature,
        ST_Area(geom) as surface,
        geom
    FROM
        {{ source('public', source_table_name) }}
{% endmacro %}
