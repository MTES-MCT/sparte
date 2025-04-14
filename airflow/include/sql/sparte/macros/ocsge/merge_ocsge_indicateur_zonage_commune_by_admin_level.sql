{% macro merge_ocsge_indicateur_zonage_commune_by_admin_level(indicateur, group_by_column) %}

{% set indicateur_table = indicateur + '_zonage_commune' %}


    with
        without_percent as (
            select
                {{ indicateur_table }}.{{ group_by_column }} as code,
                year,
                index,
                {{ indicateur_table }}.departement,
                sum(zonage_surface) as zonage_surface,
                sum(indicateur_surface) as indicateur_surface,
                zonage_type,
                sum(zonage_count) as zonage_count
            from {{ ref(indicateur_table) }}
            WHERE
            {{ group_by_column }} IS NOT NULL
            group by {{ group_by_column }}, year, index, zonage_type, {{ indicateur_table }}.departement
        )
    select
        code,
        year,
        index,
        departement,
        zonage_surface,
        indicateur_surface,
        indicateur_surface / zonage_surface * 100 as indicateur_percent,
        zonage_type,
        zonage_count
    from without_percent

{% endmacro %}
