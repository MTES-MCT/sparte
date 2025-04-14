{% macro merge_artif_commune_zonage_by_admin_level(group_by_column) %}

    with
        without_percent as (
            select
                artif_zonage_commune.{{ group_by_column }} as code,
                year,
                index,
                artif_zonage_commune.departement,
                sum(surface) as surface,
                sum(artificial_surface) as artificial_surface,
                zonage_type,
                sum(zonage_count) as zonage_count
            from {{ ref("artif_zonage_commune") }}
            WHERE
            {{ group_by_column }} IS NOT NULL
            group by {{ group_by_column }}, year, index, zonage_type, artif_zonage_commune.departement
        )
    select
        code,
        year,
        index,
        departement,
        surface,
        artificial_surface,
        artificial_surface / surface * 100 as artificial_percent,
        zonage_type,
        zonage_count
    from without_percent

{% endmacro %}
