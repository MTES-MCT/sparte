{% macro region(source_table_name) %}
    {{ config(materialized='table') }}

    with simplified as (
        {{
            simplify(
                source=source('public', source_table_name),
                geo_field='geom',
                id_field='insee_reg',
                tolerance='1500'
            )
        }}
    )
    SELECT
        id,
        nom as name,
        insee_reg as code,
        ST_Area(source.geom) as surface,
        source.geom,
        simplified.geom as simple_geom
    FROM
        {{ source('public', source_table_name) }} as source
    LEFT JOIN
        simplified
    ON
        source.insee_reg = simplified.id_field

{% endmacro %}
