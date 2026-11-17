/*
    Dans les tuiles de communes de la carte nationale, chaque commune est dessinée là où le
    placement de sa région le prévoit, à la bonne taille :
    - une commune de l'Hexagone ou de la Corse garde l'emprise et la surface de son
      simple_geom ;
    - une commune d'outre-mer a l'emprise de son simple_geom une fois le facteur et la
      translation de sa région appliqués, et sa surface multipliée par le carré du facteur.

    Tout est mesuré en EPSG:3857, la projection dans laquelle le placement est défini.
    L'emprise attendue est calculée par l'arithmétique du placement, sans passer par la
    macro qui déplace les géométries du modèle. Tolérances : 1 cm sur l'emprise, un
    millionième sur la surface, pour absorber l'aller-retour par EPSG:4326.

    Le test retourne les communes mal placées ou mal dimensionnées.
*/

WITH compared AS MATERIALIZED (
    -- MATERIALIZED : sans lui, les reprojections sont recalculées dans chaque condition
    SELECT
        tiles.land_id,
        tiles."{{ var('REGION') }}" AS region_code,
        coalesce(placement.scale_factor, 1) AS scale_factor,
        coalesce(placement.x_offset, 0) AS x_offset,
        coalesce(placement.y_offset, 0) AS y_offset,
        ST_Transform(land.simple_geom, 3857) AS source_geom,
        ST_Transform(tiles.geom, 3857) AS tile_geom
    FROM {{ ref('for_vector_tiles_communes_national') }} AS tiles
    JOIN {{ ref('land') }} AS land
        ON land.land_id = tiles.land_id
        AND land.land_type = '{{ var("COMMUNE") }}'
    LEFT JOIN {{ ref('national_map_drom_placement') }} AS placement
        ON placement.region_code = tiles."{{ var('REGION') }}"
)

SELECT
    land_id,
    region_code,
    scale_factor,
    ST_Area(tile_geom) / ST_Area(source_geom) AS area_ratio,
    ST_XMin(tile_geom) - (scale_factor * ST_XMin(source_geom) + x_offset) AS x_min_gap,
    ST_YMin(tile_geom) - (scale_factor * ST_YMin(source_geom) + y_offset) AS y_min_gap,
    ST_XMax(tile_geom) - (scale_factor * ST_XMax(source_geom) + x_offset) AS x_max_gap,
    ST_YMax(tile_geom) - (scale_factor * ST_YMax(source_geom) + y_offset) AS y_max_gap
FROM compared
WHERE abs(ST_XMin(tile_geom) - (scale_factor * ST_XMin(source_geom) + x_offset)) > 0.01
    OR abs(ST_YMin(tile_geom) - (scale_factor * ST_YMin(source_geom) + y_offset)) > 0.01
    OR abs(ST_XMax(tile_geom) - (scale_factor * ST_XMax(source_geom) + x_offset)) > 0.01
    OR abs(ST_YMax(tile_geom) - (scale_factor * ST_YMax(source_geom) + y_offset)) > 0.01
    OR abs(ST_Area(tile_geom) - scale_factor * scale_factor * ST_Area(source_geom))
    > 0.000001 * ST_Area(tile_geom)
