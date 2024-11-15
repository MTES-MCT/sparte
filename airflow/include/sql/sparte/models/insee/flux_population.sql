{{
    config(
        materialized='table',
        indexes=[{'columns': ['code_commune'], 'type': 'btree'}]
    )
}}
with flux as (
    SELECT
        *, -- keep stock columns
        (population_2010 - population_2009) as population_2009_2010,
        (population_2011 - population_2010) as population_2010_2011,
        (population_2012 - population_2011) as population_2011_2012,
        (population_2013 - population_2012) as population_2012_2013,
        (population_2014 - population_2013) as population_2013_2014,
        (population_2015 - population_2014) as population_2014_2015,
        (population_2016 - population_2015) as population_2015_2016,
        (population_2017 - population_2016) as population_2016_2017,
        (population_2018 - population_2017) as population_2017_2018,
        (population_2019 - population_2018) as population_2018_2019,
        (population_2020 - population_2019) as population_2019_2020,
        (population_2021 - population_2020) as population_2020_2021
    FROM
        {{ ref('population_cog_2024') }}
)
SELECT
    code_commune,
    population_2009,
    population_2010,
    population_2011,
    population_2012,
    population_2013,
    population_2014,
    population_2015,
    population_2016,
    population_2017,
    population_2018,
    population_2019,
    population_2020,
    population_2021,
    {% call(start_year, end_year) cumulative_flux(
        first_available_year=2009,
        last_available_year=2020
    ) %}
        (
        {% for first_year in range(start_year, end_year + 1) -%}
            {% set next_year = first_year + 1 -%}
            population_{{ first_year }}_{{ next_year }}
            {% if not loop.last -%} + {% endif %}
        {% endfor %}
        ) as population_{{ start_year }}_{{ end_year + 1 }}
    {% endcall %}
FROM
    flux
