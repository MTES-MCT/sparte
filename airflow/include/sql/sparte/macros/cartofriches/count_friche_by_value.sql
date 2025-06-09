{% macro count_friche_by_value(
    row_name,
    values,
    value_type='text'
)%}

{{ config(
    materialized="table",
    indexes=[
            {"columns": ["land_id"], "type": "btree"},
            {"columns": ["land_type"], "type": "btree"},
            {"columns": [row_name], "type": "btree"},
    ]
) }}

WITH possible_values AS (
    SELECT UNNEST(ARRAY[
        {% for val in values %}
            '{{ val }}'::{{ value_type }}
            {% if not loop.last %}, {% endif %}
        {% endfor %}
    ]) AS {{ row_name }}
),

land_base AS (
    SELECT
        land_type,
        land_id,
        land_name,
        site_id
    FROM {{ ref('friche_land') }}
),

friche_data AS (
    SELECT
        site_id,
        {{ row_name }},
        surface
    FROM {{ ref('friche') }}
)

SELECT
    l.land_type,
    l.land_id,
    l.land_name,
    v.{{ row_name }},
    COUNT(f.surface) AS friche_count,
    COALESCE(SUM(f.surface), 0) AS friche_surface
FROM
    land_base l
CROSS JOIN
    possible_values v
LEFT JOIN
    friche_data f
    ON f.site_id = l.site_id
    AND f.{{ row_name }} = v.{{ row_name }}
GROUP BY
    l.land_type,
    l.land_id,
    l.land_name,
    v.{{ row_name }}
ORDER BY
    l.land_type,
    l.land_id,
    v.{{ row_name }}

{% endmacro %}
