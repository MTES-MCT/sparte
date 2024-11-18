{{ config(materialized='table') }}

{% for to_year in range(2010, 2023) %}
    {% for from_year in range(2009, to_year) %}
        {% if from_year >= to_year %}
            {% break %}
        {% endif %}
        SELECT
            flux_population.code_commune,
            {{ from_year }} as from_year,
            {{ to_year }} as to_year,
            {{ sum_percent(
                'evolution',
                'stock_population.population_' + from_year|string
            ) }},
            max(stock_population.population_{{ from_year }}) as start_population
        FROM
            {{ ref('flux_population_commune') }} as flux_population
        LEFT JOIN
            {{ ref('commune') }} as commune
        ON commune.code = flux_population.code_commune
        LEFT JOIN
            {{ ref('population_cog_2024') }} as stock_population
        ON stock_population.code_commune = flux_population.code_commune
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
