{% macro departement(source_table_name) %}
    {{ config(materialized='table') }}

    SELECT
        id,
        nom as name,
        nom_m as name_uppercase,
        insee_dep as code,
        insee_reg as region,
        ST_Area(geom) as surface,
        geom
    FROM
        {{ source('public', source_table_name) }} as departement
{% endmacro %}
