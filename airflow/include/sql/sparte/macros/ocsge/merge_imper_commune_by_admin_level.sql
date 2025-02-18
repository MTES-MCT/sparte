{% macro merge_imper_commune_by_admin_level(group_by_column) %}


with without_percent as (
SELECT
    {{ group_by_column }},
    year,
    sum(imper_commune.surface) as impermeable_surface,
    sum(commune.surface) as surface,
    array_agg(distinct commune.departement) as departements
 FROM
    {{ ref('imper_commune') }}
LEFT JOIN
    {{ ref('commune') }}
    ON imper_commune.commune_code = commune.code
WHERE
    {{ group_by_column }} IS NOT NULL
GROUP BY
    {{ group_by_column }}, year
)
SELECt
    *,
    impermeable_surface / surface * 100 as percent
 FROM without_percent


{% endmacro %}
