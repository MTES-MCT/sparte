{% macro merge_imper_commune_by_sol_and_admin_level(group_by_column, sol) %}


with without_percent as (
SELECT
    {{ group_by_column }},
    year,
    {{ sol }},
    sum(imper_commune_by_{{ sol }}.surface) as impermeable_surface,
    sum(commune.surface) as surface,
    array_agg(distinct commune.departement) as departements
 FROM
    {{ ref('imper_commune_by_' + sol) }}
LEFT JOIN
    {{ ref('commune') }}
    ON imper_commune_by_{{ sol }}.commune_code = commune.code
WHERE
    {{ group_by_column }} IS NOT NULL
GROUP BY
    {{ group_by_column }}, {{ sol }}, year
)
SELECt
    without_percent.{{ group_by_column }},
    without_percent.year,
    without_percent.impermeable_surface / without_percent.surface * 100 as percent_of_{{ group_by_column }},
    without_percent.impermeable_surface as surface,
    without_percent.{{ sol }},
    (100 * without_percent.impermeable_surface) / imper_{{ group_by_column }}.impermeable_surface
    as percent_of_imper
 FROM without_percent
 LEFT JOIN
    {{ ref('imper_' + group_by_column) }} as imper_{{ group_by_column }}
    ON without_percent.{{ group_by_column }} = imper_{{ group_by_column }}.{{ group_by_column }}
    AND without_percent.year = imper_{{ group_by_column }}.year


{% endmacro %}
