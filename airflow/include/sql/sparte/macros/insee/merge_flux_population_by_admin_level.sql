{% macro merge_flux_population_by_admin_level(
    group_by_column,
    code_name
) %}
SELECT
        {{ group_by_column }} as {{ code_name }},
        {% call(start_year, end_year) cumulative_flux(
            first_available_year=2009,
            last_available_year=2020
        ) %}
            sum(population_{{ start_year }}_{{ end_year + 1 }})
            as population_{{ start_year }}_{{ end_year + 1 }}
        {% endcall %}
FROM
    {{ ref('flux_population') }} as flux_population
LEFT JOIN
    {{ ref('commune') }}
    ON commune.code = flux_population.code_commune
LEFT JOIN
    {{ ref('scot_communes') }} as scot_communes
    ON commune.code = scot_communes.commune_code
-- la condition suivante est nécessaire car un grand nombre de communes ne fait pas partie d'un SCOT,
-- et plus rarement certaines communes ne font pas partie d'un EPCI
WHERE
    {{ group_by_column }} IS NOT NULL
GROUP BY
    {{ group_by_column }}
{% endmacro %}
