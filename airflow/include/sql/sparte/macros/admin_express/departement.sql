{% macro departement(source_table_name) %}
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
        code_insee_de_la_region as region,
        ST_Area(departement.geom) as surface,
        departement.geom,
        simplified.geom as simple_geom
    FROM
        {{ source('public', source_table_name) }} as departement
    LEFT JOIN
        simplified
    ON
        departement.code_insee = simplified.id_field
{% endmacro %}
