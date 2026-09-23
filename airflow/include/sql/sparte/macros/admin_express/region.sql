{% macro region(source_table_name) %}
    {{ config(materialized='table') }}

    with simplified as (
        {{
            simplify(
                source=source('public', source_table_name),
                geo_field='geom',
                id_field='code_insee',
                tolerance='1500'
            )
        }}
    )
    SELECT
        cleabs as id,
        nom_officiel as name,
        nom_officiel_en_majuscules as name_uppercase,
        code_insee as code,
        ST_Area(source.geom) as surface,
        source.geom,
        simplified.geom as simple_geom
    FROM
        {{ source('public', source_table_name) }} as source
    LEFT JOIN
        simplified
    ON
        source.code_insee = simplified.id_field

{% endmacro %}
