{% macro merge_population(final_commune_code, communes_code_to_merge) %}

SELECT
    min('{{ final_commune_code }}') as code_commune,
    sum(population_2022) as population_2022,
    sum(population_2021) as population_2021,
    sum(population_2020) as population_2020,
    sum(population_2019) as population_2019,
    sum(population_2018) as population_2018,
    sum(population_2017) as population_2017,
    sum(population_2016) as population_2016,
    sum(population_2015) as population_2015,
    sum(population_2014) as population_2014,
    sum(population_2013) as population_2013,
    sum(population_2012) as population_2012,
    sum(population_2011) as population_2011,
    sum(population_2010) as population_2010,
    sum(population_2009) as population_2009
FROM
    {{ ref('population') }}
WHERE
    code_commune in (
        '{{ final_commune_code }}',
        {% for code in communes_code_to_merge %}
            '{{ code }}'
            {% if not loop.last %},{% endif %}
        {% endfor %}
    )
{% endmacro %}
