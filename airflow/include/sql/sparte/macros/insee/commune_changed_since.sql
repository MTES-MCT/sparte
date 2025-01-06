{% macro commune_changed_since(from_year, to_year) %}
{% if not to_year %}
    {% set to_year = 2024 %}
{% endif %}
(
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
