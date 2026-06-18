{% macro divide_majic(initial_commune_code, final_commune_code, percent=none, start_year=2009, end_year=2024) %}
{% set categories = ['', '_activite', '_habitat', '_mixte', '_route', '_ferroviaire', '_inconnu'] %}
{#
    When `percent` is omitted, it is derived from the territories: the final
    commune gets the share of its surface over the total surface of both
    communes, using `commune` (the geometry source of truth).
#}
{% set auto_percent = percent is none %}
{% if auto_percent %}
{% set percent %}100.0 * commune.surface / nullif(initial_commune.surface + commune.surface, 0){% endset %}
{% endif %}
SELECT
        '{{ final_commune_code }}' as commune_code,
        {% for year in range(start_year, end_year) %}
        {% for category in categories %}
        conso_{{ year }}{{ category }} * ({{ percent }}) / 100 as conso_{{ year }}{{ category }},
        {% endfor %}
        {% endfor %}
        {% for category in categories %}
        conso_{{ start_year }}_{{ end_year }}{{ category }} * ({{ percent }}) / 100 as conso_{{ start_year }}_{{ end_year }}{{ category }},
        {% endfor %}
        commune.geom
FROM
    {{ ref('consommation') }} as consommation
LEFT JOIN
    {{ ref('commune') }} as commune on commune.code = '{{ final_commune_code }}'
{% if auto_percent %}
LEFT JOIN
    (select surface from {{ ref('commune') }} where code = '{{ initial_commune_code }}') as initial_commune on true
{% endif %}
WHERE
    consommation.commune_code = '{{ initial_commune_code }}'
{% endmacro %}
