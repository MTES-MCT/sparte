{% macro departement(source_table_name) %}
    {{ config(materialized='table') }}
    with simplified as (
        {{
            simplify(
                source=source('public', source_table_name),
                geo_field='geom',
                id_field='insee_dep',
                tolerance='1500'
            )
        }}
    )
    SELECT
        id,
        nom as name,
        nom_m as name_uppercase,
        insee_dep as code,
        insee_reg as region,
        ST_Area(departement.geom) as surface,
        departement.geom,
        simplified.geom as simple_geom
    FROM
        {{ source('public', source_table_name) }} as departement
    LEFT JOIN
        simplified
    ON
        departement.insee_dep = simplified.id_field
{% endmacro %}
