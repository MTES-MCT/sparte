{% macro merge_flux_population_by_admin_level(
    group_by_column,
    code_name
) %}
SELECT
        {{ group_by_column }} as {{ code_name }},
        {% set last_available_year = 2020 %}
        {% set first_available_year = 2009 %}
        {% set ns = namespace(continued=false) %}
        {% for start_year in range(2009, last_available_year + 1) %}
            {% for end_year in range(2009, last_available_year + 1) -%}
                {% if start_year > end_year -%}
                    {% set ns.continued = true %}
                    {% continue %}
                {% else %}
                    {% set ns.continued = false %}
                {% endif %}
                sum(population_{{ start_year }}_{{ end_year + 1 }})
                as population_{{ start_year }}_{{ end_year + 1 }}
                {% if not loop.last and not ns.continued -%}, {% endif %}
            {% endfor %} {% if not loop.last and not ns.continued -%}, {% endif %}
        {% endfor %}
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
