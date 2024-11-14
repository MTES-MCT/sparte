{% macro merge_majic_by_admin_level(
    group_by_column,
    code_name
) %}
SELECT
        {{ group_by_column }} as {{ code_name }},
        {% set last_available_year = 2022 %}
        {% set first_available_year = 2009 %}
        {% set type_conso_suffixes = ["", "_activite", "_habitat"] %}
        {% set ns = namespace(continued=false) %}
        {% for type_conso_suffix in type_conso_suffixes %}
            {% for start_year in range(2009, last_available_year + 1) %}
                {% for end_year in range(2009, last_available_year + 1) -%}
                    {% if start_year > end_year -%}
                        {% set ns.continued = true %}
                        {% continue %}
                    {% else %}
                        {% set ns.continued = false %}
                    {% endif %}
                    sum(conso_{{ start_year }}_{{ end_year + 1 }}{{ type_conso_suffix }})
                    as conso_{{ start_year }}_{{ end_year + 1 }}{{ type_conso_suffix }}
                    {% if not loop.last and not ns.continued -%}, {% endif %}
                {% endfor %} {% if not loop.last and not ns.continued -%}, {% endif %}
            {% endfor %}
            {% if not loop.last -%}, {% endif %}
        {% endfor %}
FROM
    {{ ref('consommation_cog_2024') }} as consommation
LEFT JOIN
    {{ ref('commune') }}
    ON commune.code = consommation.commune_code
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
