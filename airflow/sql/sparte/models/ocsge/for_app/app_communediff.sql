{{ config(materialized='table') }}

SELECT
    foo.year_old,
    foo.year_new,
    foo.new_artif,
    foo.new_natural,
    app_commune.id as city_id,
    foo.new_artif - foo.new_natural AS net_artif
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
) as foo
LEFT JOIN {{ ref('app_commune') }} AS app_commune
ON app_commune.insee = foo.commune_code
