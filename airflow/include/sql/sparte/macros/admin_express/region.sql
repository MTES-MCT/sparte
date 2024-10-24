{% macro region(source_table_name) %}
    {{ config(materialized='table') }}

    SELECT
        id,
        nom as name,
        insee_reg as code,
        ST_Area(geom) as surface,
        geom
    FROM
        {{ source('public', source_table_name) }}
{% endmacro %}
