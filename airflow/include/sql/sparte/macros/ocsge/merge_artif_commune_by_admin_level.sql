{% macro merge_artif_commune_by_admin_level(group_by_column) %}


with without_percent as (
SELECT
    {{ group_by_column }},
    year,
    sum(artif_commune.surface) as artificial_surface,
    sum(commune.surface) as surface,
    array_agg(distinct commune.departement) as departements,
    bool_and(official_artif) as official_artif
 FROM
    {{ ref('artif_commune') }}
LEFT JOIN
    {{ ref('commune') }}
    ON artif_commune.commune_code = commune.code
WHERE
    {{ group_by_column }} IS NOT NULL
GROUP BY
    {{ group_by_column }}, year
)
SELECt
    *,
    artificial_surface / surface * 100 as percent
 FROM without_percent


{% endmacro %}
