{{ config(materialized='table') }}

{% for year in range(2013, 2024) %}
SELECT
    commune_name,
    commune_code,
    {{ year }} as year,
    total_{{ year }} as total,
    ROUND(total_{{ year }} * taux_vacants_{{ year }} / 100) as vacants,
    taux_vacants_{{ year }} as taux_vacants
FROM
    {{ ref('rpls_national')}}
{% if not loop.last %}
UNION
{% endif %}
{% endfor %}
