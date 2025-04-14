{% macro merge_artif_commune_by_sol_and_admin_level(group_by_column, sol) %}


with without_percent as (
    SELECT
        commune.{{ group_by_column }} as code,
        year,
        {{ sol }},
        sum(artif_commune_by_{{ sol }}.artificial_surface) as artificial_surface,
        sum(commune.surface) as surface,
        commune.departement as departement,
        artif_commune_by_{{ sol }}.index as index
    FROM
        {{ ref('artif_commune_by_' + sol) }}
    LEFT JOIN
        {{ ref('commune') }}
        ON artif_commune_by_{{ sol }}.code = commune.code
    WHERE
        commune.{{ group_by_column }} IS NOT NULL
    GROUP BY
        commune.{{ group_by_column }}, {{ sol }}, year, commune.departement, artif_commune_by_{{ sol }}.index
)
SELECt
    without_percent.code,
    without_percent.departement,
    without_percent.index,
    without_percent.year,
    without_percent.artificial_surface / without_percent.surface * 100 as percent_of_land,
    without_percent.artificial_surface as artificial_surface,
    without_percent.{{ sol }},
    (100 * without_percent.artificial_surface) / artif_{{ group_by_column }}.artificial_surface as percent_of_artif
 FROM without_percent
 LEFT JOIN
    {{ ref('artif_' + group_by_column) }} as artif_{{ group_by_column }}
    ON without_percent.code = artif_{{ group_by_column }}.code
    AND without_percent.year = artif_{{ group_by_column }}.year
    AND without_percent.departement = artif_{{ group_by_column }}.departement


{% endmacro %}
