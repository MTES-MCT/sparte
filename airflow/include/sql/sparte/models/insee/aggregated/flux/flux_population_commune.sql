{{
    config(
        materialized='table',
        indexes=[{'columns': ['code_commune'], 'type': 'btree'}]
    )
}}


{% set last_year_insee = 2022 %}
{% set last_year_mondiagartif = 2023 %}
with known_years as (
    {% for year in range(2009, last_year_insee) %}
        {% set next_year = year + 1 %}
        SELECT
            code_commune,
            {{ year }} as year,
            (population_{{ next_year }} - population_{{ year }}) as evolution,
            population_{{ year }} as population,
            'INSEE' as source
        FROM
            {{ ref('population_cog_2024') }}
        {% if not loop.last %}
            UNION
        {% endif %}
    {% endfor %}
), average_evolutions as (
    SELECT
        code_commune,
        AVG(evolution) as average_evolution
    FROM
        known_years
    GROUP BY
        code_commune
), estimations as (
    {% for year in range(last_year_insee, last_year_mondiagartif + 1) %}
        SELECT
            population_cog_2024.code_commune,
            {{ year }} as year,
            {% if year == last_year_insee %}
              round(population_{{ year }}) as population,
            {% else %}
                round(population_{{ last_year_insee }} + (average_evolution * ({{ year }} - {{ last_year_insee }}))) as population,
            {% endif %}
            'PROJECTION' as source
        FROM
            {{ ref('population_cog_2024') }}
        LEFT JOIN
            average_evolutions
        ON
        average_evolutions.code_commune = population_cog_2024.code_commune
        {% if not loop.last %}
            UNION ALL
        {% endif %}
    {% endfor %}
), estimations_with_evolution as (
    SELECT
        code_commune,
        year,
        COALESCE(
            (LEAD(population) OVER (PARTITION BY code_commune ORDER BY year) - population),
            (LAG(population) OVER (PARTITION BY code_commune ORDER BY year) - population) * - 1
        ) as evolution,
        population,
        source
    FROM
        estimations
)
SELECT * FROM known_years
UNION ALL
SELECT * FROM estimations_with_evolution
