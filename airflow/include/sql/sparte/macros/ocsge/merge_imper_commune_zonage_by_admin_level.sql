{% macro merge_imper_commune_zonage_by_admin_level(group_by_column) %}

    with
        without_percent as (
            select
                {{ group_by_column }},
                year,
                array_agg(distinct departement) as departements,
                sum(surface) as surface,
                sum(impermeable_surface) as impermeable_surface,
                zonage_type,
                sum(zonage_count) as zonage_count
            from {{ ref("imper_zonage_commune") }}
            WHERE
            {{ group_by_column }} IS NOT NULL
            group by {{ group_by_column }}, year, zonage_type
        )
    select
        {{ group_by_column }},
        year,
        departements,
        surface,
        impermeable_surface,
        impermeable_surface / surface * 100 as impermeable_percent,
        zonage_type,
        zonage_count
    from without_percent

{% endmacro %}
