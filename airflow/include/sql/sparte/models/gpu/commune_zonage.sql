
{{ config(materialized='table')}}

with zonages_as_points as (
    SELECT
        checksum,
        ST_PointOnSurface(geom) as geom,
        srid_source
    FROM
        {{ ref('zonage_urbanisme') }}
)
SELECT
    c.code as commune,
    c.departement,
    c.region,
    c.epci,
    c.ept,
    s.id_scot as scot,
    zonages_as_points.checksum as zonage_checksum
FROM zonages_as_points
INNER JOIN {{ ref('commune')}} as c
ON ST_Contains(c.geom, zonages_as_points.geom)
AND zonages_as_points.srid_source = c.srid_source
LEFT JOIN {{ ref('scot_communes') }} as s
ON c.code = s.commune_code
