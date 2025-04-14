{% macro merge_artif_commune_by_admin_level(group_by_column) %}


with without_percent as (
SELECT
    {{ group_by_column }} as code,
    artif_commune.year,
    sum(artif_commune.artificial_surface) as artificial_surface,
    sum(artif_commune.surface) as surface,
    artif_commune.departement as departement,
    artif_commune.index as index
 FROM
    {{ ref('artif_commune') }}
LEFT JOIN
    {{ ref('commune') }}
    ON artif_commune.code = commune.code
WHERE
    {{ group_by_column }} IS NOT NULL
GROUP BY
    {{ group_by_column }}, year, artif_commune.departement, artif_commune.index
)
SELECt
    *,
    artificial_surface / surface * 100 as percent
 FROM without_percent


{% endmacro %}
