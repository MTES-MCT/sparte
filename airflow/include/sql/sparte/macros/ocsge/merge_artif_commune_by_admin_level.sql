{% macro merge_artif_commune_by_admin_level(group_by_column) %}


with without_percent as (
SELECT
    {{ group_by_column}},
    year,
    sum(surface) as surface,
    sum(artificial_surface) as artificial_surface,
    zonage_type,
    sum(zonage_count) as zonage_count
FROM {{ ref('artif_commune')}}
GROUP BY
    {{ group_by_column}},
    year,
    zonage_type
)
SELECT
    {{ group_by_column }},
    year,
    surface,
    artificial_surface,
    artificial_surface / surface * 100 as artificial_percent,
    zonage_type,
    zonage_count
FROM
    without_percent

{% endmacro %}
