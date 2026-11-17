/*
    La limite d'un parent ne quitte les limites des entités du fond que pour traverser une
    entité à cheval. Partout ailleurs elle doit se confondre avec elles : un tronçon qui
    s'en écarte dessinerait un second trait à côté d'une limite d'EPCI.

    On retire de la limite ce qui suit les contours du fond (à un centimètre près : les
    nœuds ajoutés par le redécoupage sont calculés, donc posés sur leur segment à une
    fraction de micromètre), puis ce qui est dans une entité à cheval. Il ne doit rien rester.
*/

{% set max_stray_length = 1 %}

WITH members AS (
    SELECT
        boundary.land_id,
        boundary.land_type,
        boundary.child_land_type,
        cardinality(array(
            SELECT 1
            FROM unnest(child.parent_keys) AS parent_key
            WHERE starts_with(parent_key, boundary.land_type || '_')
        )) > 1 AS is_straddling,
        light.geom
    FROM {{ ref('land_national_map_parent_boundary_geom') }} AS boundary
    JOIN {{ ref('land') }} AS child
        ON child.parent_keys @> ARRAY[boundary.land_type || '_' || boundary.land_id]
        AND child.land_type = boundary.child_land_type
    JOIN {{ ref('land_national_map_geom') }} AS light
        ON light.land_id = child.land_id
        AND light.land_type = child.land_type
),

references_by_parent AS (
    SELECT
        land_id,
        land_type,
        child_land_type,
        ST_Buffer(ST_Union(ST_Boundary(geom)), 0.01) AS outlines,
        ST_Buffer(ST_Union(geom) FILTER (WHERE is_straddling), 1) AS straddling
    FROM members
    GROUP BY land_id, land_type, child_land_type
),

strays AS (
    SELECT
        boundary.land_id,
        boundary.land_type,
        boundary.child_land_type,
        ST_Length(
            CASE
                WHEN refs.straddling IS NULL THEN ST_Difference(boundary.geom, refs.outlines)
                ELSE ST_Difference(ST_Difference(boundary.geom, refs.outlines), refs.straddling)
            END
        ) AS stray_length
    FROM {{ ref('land_national_map_parent_boundary_geom') }} AS boundary
    JOIN references_by_parent AS refs USING (land_id, land_type, child_land_type)
)

SELECT *
FROM strays
WHERE stray_length > {{ max_stray_length }}
