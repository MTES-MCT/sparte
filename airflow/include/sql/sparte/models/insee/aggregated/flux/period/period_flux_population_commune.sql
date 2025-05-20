{{ config(materialized='table') }}

{% for to_year in range(2010, 2024) %}
    {% for from_year in range(2009, to_year) %}
        {% if from_year >= to_year %}
            {% break %}
        {% endif %}
        SELECT
            flux_population.code_commune,
            {{ from_year }} as from_year,
            {{ to_year }} as to_year,
            sum(flux_population.evolution) as evolution,
            sum(flux_population.evolution) * 100.0 /
            CASE
                WHEN max((SELECT population FROM {{ ref('flux_population_commune') }} WHERE year = '{{ from_year|string }}' AND code_commune = flux_population.code_commune)) = 0 THEN 1
                ELSE max((SELECT population FROM {{ ref('flux_population_commune') }} WHERE year = '{{ from_year|string }}' AND code_commune = flux_population.code_commune))
            END as evolution_percent,
            max((SELECT population FROM {{ ref('flux_population_commune') }} WHERE year = '{{ from_year|string }}' AND code_commune = flux_population.code_commune)) as start_population
        FROM
            {{ ref('flux_population_commune') }} as flux_population
        LEFT JOIN
            {{ ref('commune') }} as commune
        ON commune.code = flux_population.code_commune
        WHERE year BETWEEN {{ from_year }} AND {{ to_year }}
        GROUP BY
            flux_population.code_commune,
            from_year,
            to_year
        {% if not loop.last %}
            UNION
        {% endif %}
    {% endfor %}
            {% if not loop.last %}
            UNION
        {% endif %}
{% endfor %}
