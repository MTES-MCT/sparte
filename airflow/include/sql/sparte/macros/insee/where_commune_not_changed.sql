{% macro where_commune_not_changed(commune_code_field, from_year, to_year) %}
{% if not to_year %}
    {% set to_year = 2024 %}
{% endif %}

WHERE {{ commune_code_field }} not in (
    SELECT code_commune_avant
        FROM {{ ref('cog_changes_2024') }}
    WHERE
        date_part('year', date_effet) BETWEEN {{ from_year }} and {{ to_year }}
    UNION
    SELECT code_commune_apres
        FROM {{ ref('cog_changes_2024') }}
    WHERE
        date_part('year', date_effet) BETWEEN {{ from_year }} and {{ to_year }}
)

{% endmacro %}
