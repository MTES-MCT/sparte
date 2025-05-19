{% macro epci(source_table_name) %}
    {{ config(materialized='table') }}
    with simplified as (
        {{
            simplify(
                source=source('public', source_table_name),
                geo_field='geom',
                id_field='code_siren',
                tolerance='250'
            )
        }}
    )
    SELECT
        id,
        nom as name,
        code_siren as code,
        nature,
        ST_Area(epci.geom) as surface,
        epci.geom,
        {{ is_ept('code_siren') }} as is_ept,
        simplified.geom as simple_geom
    FROM
        {{ source('public', source_table_name) }} as epci
    LEFT JOIN
        simplified
    ON
        epci.code_siren = simplified.id_field
{% endmacro %}
