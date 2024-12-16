{{
    config(
        materialized='table',
        indexes=[{'columns': ['code_commune'], 'type': 'btree'}]
    )
}}
with known_years as (
    {% for year in range(2009, 2021) %}
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
), average_evolution as (
    SELECT
        code_commune,
        AVG(evolution) as average_evolution
    FROM
        known_years
    GROUP BY
        code_commune
), predictions as (
    {% set first_unknown_year = 2021 %}
    {% for year in range(first_unknown_year, 2023) %}
        {% set next_year = year + 1 %}
            SELECT
                code_commune,
                {{ year }} as year,
                (
                    SELECT  round(average_evolution)::numeric
                    FROM    average_evolution
                    WHERE   code_commune = pop.code_commune
                ) as evolution,
                population_{{ first_unknown_year }} + (
                    SELECT  round(average_evolution)::numeric
                    FROM    average_evolution
                    WHERE   code_commune = pop.code_commune
                ) * ({{ year }} - 2020) as population,
                'PROJECTION' as source
            FROM
                {{ ref('population_cog_2024') }} as pop
            {% if not loop.last %}
                UNION
            {% endif %}
    {% endfor %}
)
SELECT * FROM known_years
UNION
SELECT * FROM predictions
