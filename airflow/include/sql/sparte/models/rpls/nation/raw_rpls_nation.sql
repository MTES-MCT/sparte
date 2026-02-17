{{ config(materialized='table') }}

SELECT
    'France'::text as nation_name,
    'NATION'::text as nation_code,
    {% for year in range(2013, 2025) %}
    sum(total_{{ year }}) as total_{{ year }},
    CASE
        WHEN sum(total_{{ year }}) = 0 THEN 0
        ELSE sum(total_{{ year }} * taux_vacants_{{ year }}) / sum(total_{{ year }})
    END as taux_vacants_{{ year }}{% if not loop.last %},{% endif %}
    {% endfor %}
FROM
    {{ ref('raw_rpls_region') }}
