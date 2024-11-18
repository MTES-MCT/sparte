{% macro merge_flux_population_by_admin_level(
    group_by_column,
    code_name
) %}
{% if not code_name %}
    {% set code_name = group_by_column %}
{% endif %}
SELECT
    {{ group_by_column }} as {{ code_name }},
    from_year,
    to_year,
    {{ sum_percent_median_avg('evolution', 'start_population') }},
    sum(start_population) as start_population
FROM
    {{ ref('flux_population_commune') }} as population
LEFT JOIN
    {{ ref('commune') }} as commune
    ON commune.code = population.code_commune
LEFT JOIN
    {{ ref('scot_communes') }} as scot_communes
    ON commune.code = scot_communes.commune_code
-- la condition suivante est nécessaire car un grand nombre de communes ne fait pas partie d'un SCOT,
-- et plus rarement certaines communes ne font pas partie d'un EPCI
WHERE
    {{ group_by_column }} IS NOT NULL
GROUP BY
    {{ group_by_column }},
    from_year,
    to_year
{% endmacro %}
