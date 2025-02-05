{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['year'], 'type': 'btree'},
            {'columns': ['uuid'], 'type': 'btree'},
            {'columns': ['zonage_checksum'], 'type': 'btree'},
            {'columns': ['ocsge_loaded_date'], 'type': 'btree'},
            {'columns': ['zonage_gpu_timestamp'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ],
    )
}}

with occupation_du_sol_zonage_urbanisme_without_surface as (
    SELECT
        concat(ocsge.uuid::text, '_', zonage.checksum::text) as ocsge_zonage_id, -- surrogate key
        -- les attributs spécifiques aux zonages sont préfixés par zonage_
        zonage.libelle AS zonage_libelle,
        zonage.checksum AS zonage_checksum,
        zonage.gpu_timestamp AS zonage_gpu_timestamp,
        zonage.surface AS zonage_surface,
        zonage.type_zone AS zonage_type,
        -- les attributs spécifiques aux objets OCS GE sont préfixés par ocsge_
        ocsge.loaded_date AS ocsge_loaded_date,
        -- les attributs communs aux deux tables sont sans préfixe
        ocsge.year,
        ocsge.departement,
        ocsge.code_cs,
        ocsge.code_us,
        ocsge.uuid,
        ocsge.is_artificial,
        ocsge.is_impermeable,
        ocsge.srid_source,
        ST_Intersection(zonage.geom, ocsge.geom) AS geom
    FROM
        {{ ref("zonage_urbanisme") }} AS zonage
    INNER JOIN
        {{ ref("occupation_du_sol") }} AS ocsge
    ON
        ST_Intersects(zonage.geom, ocsge.geom)
    AND
        zonage.srid_source = ocsge.srid_source
), occupation_du_sol_zonage_urbanisme_without_surface_with_duplicates_marked as (
    SELECT
        *,
        row_number() over (partition by geom, year, departement) as rn
    FROM
        occupation_du_sol_zonage_urbanisme_without_surface
)
SELECT
    *,
    ST_Area(geom) as surface
FROM
    occupation_du_sol_zonage_urbanisme_without_surface_with_duplicates_marked
WHERE
    rn = 1
