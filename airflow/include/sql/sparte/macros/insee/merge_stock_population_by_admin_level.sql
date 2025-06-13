{% macro merge_stock_population_by_admin_level(
    group_by_column,
    code_name
) %}
{% if not code_name %}
    {% set code_name = group_by_column %}
{% endif %}

SELECT
    {{ group_by_column }} as {{ code_name }},
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
    {{ ref('population_cog_2024') }} as population_stock
LEFT JOIN
    {{ ref('commune') }}
    ON commune.code = population_stock.code_commune
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
