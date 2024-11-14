{% macro merge_majic_by_admin_level(
    group_by_column,
    code_name
) %}
{% if not code_name %}
    {% set code_name = group_by_column %}
{% endif %}
SELECT
    {{ group_by_column}} as {{ code_name }},
    {% set type_conso_suffixes = ["", "_activite", "_habitat"] %}
    {% for type_conso_suffix in type_conso_suffixes %}
        {% call(start_year, end_year) cumulative_flux(
            first_available_year=2009,
            last_available_year=2022
        ) %}
            sum(conso_{{ start_year }}_{{ end_year + 1 }}{{ type_conso_suffix }})
            as conso_{{ start_year }}_{{ end_year + 1 }}{{ type_conso_suffix }},
            sum(conso_{{ start_year }}_{{ end_year + 1 }}{{ type_conso_suffix }}) * 100 / sum(commune.surface)
            as conso_{{ start_year }}_{{ end_year + 1 }}{{ type_conso_suffix }}_percent
        {% endcall %}
        {% if not loop.last -%}, {% endif %}
    {% endfor %}
FROM
    {{ ref('consommation_cog_2024') }} as consommation
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
    {{ group_by_column }}
{% endmacro %}
