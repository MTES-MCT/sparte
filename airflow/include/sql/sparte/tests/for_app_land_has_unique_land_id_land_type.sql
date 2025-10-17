SELECT
    land.land_id,
    land.land_type,
    count(*) as count_duplicates
FROM
    {{ ref('for_app_land') }} as land
GROUP BY
    land.land_id,
    land.land_type
HAVING
    count(*) > 1
ORDER BY
    count_duplicates DESC
