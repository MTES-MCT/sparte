
{% macro majic(source_table_name, from_year, to_year) %}
    {{ config(materialized='table') }}

    SELECT
        idcom as commune_code,
        {% for year in range(from_year | int, to_year | int) %}
        {% set y = '%02d' | format(year) %}
        {% set y_next = '%02d' | format(year + 1) %}
        naf{{ y }}art{{ y_next }}::int as conso_20{{ y }},
        art{{ y }}act{{ y_next }}::int as conso_20{{ y }}_activite,
        art{{ y }}hab{{ y_next }}::int as conso_20{{ y }}_habitat,
        art{{ y }}mix{{ y_next }}::int as conso_20{{ y }}_mixte,
        art{{ y }}rou{{ y_next }}::int as conso_20{{ y }}_route,
        art{{ y }}fer{{ y_next }}::int as conso_20{{ y }}_ferroviaire,
        art{{ y }}inc{{ y_next }}::int as conso_20{{ y }}_inconnu,
        {% endfor %}
        naf{{ from_year }}art{{ to_year }}::int as conso_20{{ from_year }}_20{{ to_year }},
        art{{ from_year }}act{{ to_year }}::int as conso_20{{ from_year }}_20{{ to_year }}_activite,
        art{{ from_year }}hab{{ to_year }}::int as conso_20{{ from_year }}_20{{ to_year }}_habitat,
        art{{ from_year }}mix{{ to_year }}::int as conso_20{{ from_year }}_20{{ to_year }}_mixte,
        art{{ from_year }}rou{{ to_year }}::int as conso_20{{ from_year }}_20{{ to_year }}_route,
        art{{ from_year }}fer{{ to_year }}::int as conso_20{{ from_year }}_20{{ to_year }}_ferroviaire,
        art{{ from_year }}inc{{ to_year }}::int as conso_20{{ from_year }}_20{{ to_year }}_inconnu,
        geom
    FROM
        {{ source('public', source_table_name) }}
{% endmacro %}
