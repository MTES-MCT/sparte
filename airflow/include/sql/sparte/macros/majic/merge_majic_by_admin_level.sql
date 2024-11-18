{% macro merge_majic_by_admin_level(
    group_by_column,
    code_name
) %}
{% if not code_name %}
    {% set code_name = group_by_column %}
{% endif %}
SELECT
    {{ group_by_column}} as {{ code_name }},
    from_year,
    to_year,
    {{ sum_percent_median_avg('total', 'commune.surface') }},
    {{ sum_percent_median_avg('activite', 'commune.surface') }},
    {{ sum_percent_median_avg('habitat', 'commune.surface') }},
    {{ sum_percent_median_avg('mixte', 'commune.surface') }},
    {{ sum_percent_median_avg('route', 'commune.surface') }},
    {{ sum_percent_median_avg('ferroviaire', 'commune.surface') }},
    {{ sum_percent_median_avg('inconnu', 'commune.surface') }}
FROM
    {{ ref('consommation_commune') }} as consommation
LEFT JOIN
    {{ ref('commune') }} as commune
    ON commune.code = consommation.commune_code
LEFT JOIN
    {{ ref('scot_communes') }} as scot_communes
    ON commune.code = scot_communes.commune_code
-- la condition suivante est nécessaire car un grand nombre de communes ne fait pas partie d'un SCOT,
-- et plus rarement certaines communes ne font pas partie d'un EPCI
WHERE
    {{ group_by_column }} IS NOT NULL
GROUP BY
    {{ group_by_column }},
    from_year,
    to_year
{% endmacro %}
