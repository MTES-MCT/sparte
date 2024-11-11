{% macro epci(source_table_name) %}
    {{ config(materialized='table') }}

    SELECT
        id,
        nom as name,
        code_siren as code,
        nature,
        ST_Area(geom) as surface,
        geom,
        {{ is_ept('code_siren') }} as is_ept
    FROM
        {{ source('public', source_table_name) }}
{% endmacro %}
