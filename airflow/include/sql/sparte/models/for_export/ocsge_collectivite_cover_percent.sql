SELECT
    land_type,
    status,
    has_ocsge,
    count(*) as count
FROM {{ ref('land_ocsge_status') }}
GROUP BY land_type, status, has_ocsge
