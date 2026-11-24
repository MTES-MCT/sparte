{{
    config(
        materialized="table",
    )
}}

/*
    Communes de toute la France pour les tuiles de la carte nationale (France entière et
    Hexagone à la maille commune, fichier `communes_national.pmtiles` produit par le DAG
    `create_communes_national_vector_tiles`).

    Une ligne par commune de `land`, avec le strict nécessaire : l'identifiant auquel la
    carte joint ses valeurs, le nom affiché au survol, et les codes de la région et du
    département. Chaque octet compte : à l'échelle du pays, une vue charge d'un coup les
    quelque 35 000 communes.

    La géométrie part de simple_geom (14 fois moins de points que geom), qui est dans la
    projection d'origine de chaque territoire. Les communes d'outre-mer sont déplacées près
    de l'Hexagone, à l'échelle de celui-ci, selon le placement de leur région
    (national_map_drom_placement) : elles se superposent ainsi aux départements du fond de
    carte, déplacés de la même façon par Django. Le placement s'applique en EPSG:3857, la
    projection de la carte. L'Hexagone et la Corse restent à leur position réelle.
*/

SELECT
    land.land_id,
    land.name,
    commune.region AS "{{ var('REGION') }}",
    commune.departement AS "{{ var('DEPARTEMENT') }}",
    ST_Multi(
        CASE
            WHEN placement.region_code IS NULL
                THEN ST_Transform(land.simple_geom, 4326)
            ELSE ST_Transform(
                {{ national_map_apply_drom_placement('ST_Transform(land.simple_geom, 3857)', 'placement') }},
                4326
            )
        END
    ) AS geom
FROM
    {{ ref('land') }} AS land
INNER JOIN
    {{ ref('commune') }} AS commune
    ON commune.code = land.land_id
LEFT JOIN
    {{ ref('national_map_drom_placement') }} AS placement
    ON placement.region_code = commune.region
WHERE
    land.land_type = '{{ var("COMMUNE") }}'
