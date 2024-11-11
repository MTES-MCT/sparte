{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    diff.year_old,
    diff.year_new,
    diff.new_artif,
    diff.new_natural,
    commune.code as city_id,
    diff.new_artif - diff.new_natural AS net_artif
FROM (
    SELECT
        year_old,
        year_new,
        SUM(CASE WHEN new_is_artificial THEN surface ELSE 0 END) / 10000 AS new_artif,
        SUM(CASE WHEN new_not_artificial THEN surface ELSE 0 END) / 10000 AS new_natural,
        commune_code
    FROM
        {{ ref("difference_commune") }}
    GROUP BY
        commune_code,
        year_old,
        year_new
) as diff
LEFT JOIN {{ ref('commune') }} AS commune
ON commune.code = diff.commune_code
