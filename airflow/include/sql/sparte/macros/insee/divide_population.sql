{% macro divide_population(initial_commune_code, final_commune_code, percent) %}

SELECT
    '{{ final_commune_code }}' as code_commune,
    population_2021 * {{ percent }} / 100 as population_2021,
    population_2020 * {{ percent }} / 100 as population_2020,
    population_2019 * {{ percent }} / 100 as population_2019,
    population_2018 * {{ percent }} / 100 as population_2018,
    population_2017 * {{ percent }} / 100 as population_2017,
    population_2016 * {{ percent }} / 100 as population_2016,
    population_2015 * {{ percent }} / 100 as population_2015,
    population_2014 * {{ percent }} / 100 as population_2014,
    population_2013 * {{ percent }} / 100 as population_2013,
    population_2012 * {{ percent }} / 100 as population_2012,
    population_2011 * {{ percent }} / 100 as population_2011,
    population_2010 * {{ percent }} / 100 as population_2010,
    population_2009 * {{ percent }} / 100 as population_2009
FROM
    {{ ref('population') }}
WHERE
    code_commune = '{{ initial_commune_code }}'

{% endmacro %}
