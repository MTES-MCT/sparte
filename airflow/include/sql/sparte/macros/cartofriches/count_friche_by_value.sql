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
        surface,
        friche_statut as statut
    FROM {{ ref('friche') }}
)

SELECT
    l.land_type,
    l.land_id,
    l.land_name,
    v.{{ row_name }},
    COUNT(f.surface) AS friche_count,
    COUNT(f.surface) filter (where f.statut = 'friche sans projet') AS friche_sans_projet_count,
    COUNT(f.surface) filter (where f.statut = 'friche avec projet') AS friche_avec_projet_count,
    COUNT(f.surface) filter (where f.statut = 'friche reconvertie') AS friche_reconvertie_count,
    COALESCE(SUM(f.surface), 0) AS friche_surface,
    COALESCE(SUM(f.surface) filter (where f.statut = 'friche sans projet'), 0) AS friche_sans_projet_surface,
    COALESCE(SUM(f.surface) filter (where f.statut = 'friche avec projet'), 0) AS friche_avec_projet_surface,
    COALESCE(SUM(f.surface) filter (where f.statut = 'friche reconvertie'), 0) AS friche_reconvertie_surface
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
