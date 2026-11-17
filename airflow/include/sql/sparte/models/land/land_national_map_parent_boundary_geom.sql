/*
    Limite d'un territoire parent, tracée sur le fond de la carte nationale à une maille
    dont les entités peuvent déborder de ce parent : le département à la maille EPCI.

    Un EPCI à cheval sur plusieurs départements est dessiné en entier sous chacun d'eux :
    il déborde, et plus rien ne montre où le département s'arrête. La limite est donc
    redessinée par-dessus. Elle doit coïncider, sommet pour sommet, avec les limites
    d'EPCI du fond partout où elle les longe, sinon la carte montre deux traits décalés.
    Or aucune géométrie existante du département ne le permet : chaque type de territoire
    est simplifié à part (land_national_map_geom, simple_geom de `land`), avec ses propres
    sommets.

    La limite est donc construite à partir des EPCI du fond eux-mêmes, parent par parent :
        1. les communes d'un EPCI à cheval sont réunies en deux morceaux, dans le parent
           et hors du parent ; la ligne qui les sépare est la limite du parent à
           l'intérieur de l'EPCI (coupe), simplifiée avec la tolérance du fond ;
        2. chaque bout d'une coupe est raccordé au contour simplifié de l'EPCI, dont il
           peut s'être écarté : seul un point où trois EPCI se rencontrent est conservé
           tel quel par les simplifications ;
        3. contours des EPCI du fond, coupes et raccords forment un seul réseau, noué puis
           redécoupé en faces ; une face d'un EPCI à cheval revient au morceau qui la
           couvre le plus ;
        4. la limite est le bord de la réunion des faces du parent. Toutes viennent du
           même réseau : leur réunion est exacte, et la limite ne quitte les limites
           d'EPCI du fond que le long des coupes.

    Pour tracer aussi la limite d'une région à la maille EPCI (EPCI à cheval sur deux
    régions), ajouter la région à `commune_column_by_parent_type` : le reste suit.
*/

{{
    config(
        materialized='table',
        indexes=[
            {"columns": ["land_id", "land_type", "child_land_type"], "type": "btree"},
        ],
    )
}}

{# Types de parent dont la limite est tracée -> colonne de `commune` qui porte leur code #}
{% set commune_column_by_parent_type = {
    var("DEPARTEMENT"): "departement",
} %}
{# Maille des entités du fond, et colonne de `commune` qui porte leur code #}
{% set child_type = var("EPCI") %}
{% set child_commune_column = "epci" %}
{# Dépassement, en mètres, des coupes et des raccords au-delà du point visé : un point
   calculé « sur » un segment ne l'est jamais exactement, et un trait qui s'arrêterait
   un nanomètre avant le contour ne découperait rien. Le bout qui dépasse est ignoré au
   redécoupage en faces. #}
{% set overshoot = 1 %}

WITH parents AS MATERIALIZED (
    SELECT
        land_id AS parent_land_id,
        land_type AS parent_land_type,
        land_type || '_' || land_id AS parent_key
    FROM {{ ref('land') }}
    WHERE land_type IN ('{{ commune_column_by_parent_type.keys() | join("', '") }}')
),

-- Entités du fond sous chaque parent, avec leur géométrie du fond
members AS MATERIALIZED (
    SELECT
        parents.parent_land_id,
        parents.parent_land_type,
        child.land_id,
        -- À cheval : l'entité a plusieurs parents de ce type
        (
            SELECT count(*)
            FROM unnest(child.parent_keys) AS parent_key
            WHERE starts_with(parent_key, parents.parent_land_type || '_')
        ) > 1 AS is_straddling,
        light.tolerance,
        light.geom
    FROM parents
    -- Jointure par appartenance seule, pour qu'elle passe par l'index GIN de parent_keys
    JOIN {{ ref('land') }} AS child
        ON child.parent_keys @> ARRAY[parents.parent_key]
    JOIN {{ ref('land_national_map_geom') }} AS light
        ON light.land_id = child.land_id
        AND light.land_type = child.land_type
    WHERE child.land_type = '{{ child_type }}'
),

-- Deux morceaux par entité à cheval : ses communes dans le parent, et les autres.
-- simple_geom des communes : cohérent entre voisines, et bien assez fin pour une coupe
-- simplifiée ensuite avec la tolérance du fond.
pieces AS MATERIALIZED (
    SELECT
        members.parent_land_id,
        members.parent_land_type,
        members.land_id,
        CASE members.parent_land_type
            {% for parent_type, commune_column in commune_column_by_parent_type.items() %}
            WHEN '{{ parent_type }}' THEN commune.{{ commune_column }}
            {% endfor %}
        END = members.parent_land_id AS is_inside,
        ST_Union(commune.simple_geom) AS geom
    FROM members
    JOIN {{ ref('commune') }} AS commune
        ON commune.{{ child_commune_column }} = members.land_id
    WHERE members.is_straddling
    GROUP BY 1, 2, 3, 4
),

-- Limite du parent à l'intérieur d'une entité à cheval : la frontière commune à ses deux morceaux
cuts AS (
    SELECT
        inside.parent_land_id,
        inside.parent_land_type,
        inside.land_id,
        (ST_Dump(
            ST_SimplifyPreserveTopology(
                ST_LineMerge(
                    ST_CollectionExtract(
                        ST_Intersection(ST_Boundary(inside.geom), ST_Boundary(outside.geom)),
                        2
                    )
                ),
                members.tolerance
            )
        )).geom AS geom
    FROM pieces AS inside
    JOIN pieces AS outside
        ON outside.parent_land_id = inside.parent_land_id
        AND outside.parent_land_type = inside.parent_land_type
        AND outside.land_id = inside.land_id
        AND NOT outside.is_inside
    JOIN members
        ON members.parent_land_id = inside.parent_land_id
        AND members.parent_land_type = inside.parent_land_type
        AND members.land_id = inside.land_id
    WHERE inside.is_inside
),

cut_ends AS (
    SELECT parent_land_id, parent_land_type, land_id, ST_StartPoint(geom) AS geom FROM cuts
    UNION ALL
    SELECT parent_land_id, parent_land_type, land_id, ST_EndPoint(geom) AS geom FROM cuts
),

-- Raccord de chaque bout de coupe au contour simplifié de son entité, par le plus court chemin
connectors AS (
    SELECT
        cut_ends.parent_land_id,
        cut_ends.parent_land_type,
        ST_ShortestLine(cut_ends.geom, ST_Boundary(members.geom)) AS geom
    FROM cut_ends
    JOIN members
        ON members.parent_land_id = cut_ends.parent_land_id
        AND members.parent_land_type = cut_ends.parent_land_type
        AND members.land_id = cut_ends.land_id
),

lines AS (
    SELECT parent_land_id, parent_land_type, ST_Boundary(geom) AS geom FROM members
    UNION ALL
    SELECT parent_land_id, parent_land_type, ST_LineExtend(geom, {{ overshoot }}, {{ overshoot }}) AS geom FROM cuts
    UNION ALL
    -- Un bout déjà posé sur le contour (point où trois entités se rencontrent) n'a pas de
    -- raccord : un trait de longueur nulle n'a pas de direction à prolonger
    SELECT parent_land_id, parent_land_type, ST_LineExtend(geom, {{ overshoot }}, 0) AS geom
    FROM connectors
    WHERE ST_Length(geom) > 0.001
),

-- Un seul réseau par parent : ST_Union noue les lignes là où elles se croisent
networks AS (
    SELECT parent_land_id, parent_land_type, ST_Union(geom) AS geom
    FROM lines
    GROUP BY parent_land_id, parent_land_type
),

faces AS MATERIALIZED (
    SELECT
        parent_land_id,
        parent_land_type,
        (ST_Dump(ST_Polygonize(geom))).geom AS geom
    FROM networks
    GROUP BY parent_land_id, parent_land_type
),

-- Face dans le parent : celle d'une entité qui n'est pas à cheval, ou celle que le morceau
-- « dans le parent » couvre le plus. À surface égale (éclat hors des deux morceaux, le long
-- d'un contour simplifié), le morceau le plus proche l'emporte. Une face hors de toute
-- entité (trou de la couverture) n'est rattachée à rien.
parent_faces AS (
    SELECT
        faces.parent_land_id,
        faces.parent_land_type,
        faces.geom
    FROM faces
    JOIN members
        ON members.parent_land_id = faces.parent_land_id
        AND members.parent_land_type = faces.parent_land_type
        AND ST_Contains(members.geom, ST_PointOnSurface(faces.geom))
    WHERE NOT members.is_straddling
        OR (
            SELECT pieces.is_inside
            FROM pieces
            WHERE pieces.parent_land_id = faces.parent_land_id
                AND pieces.parent_land_type = faces.parent_land_type
                AND pieces.land_id = members.land_id
            ORDER BY
                ST_Area(ST_Intersection(pieces.geom, faces.geom)) DESC,
                ST_Distance(pieces.geom, faces.geom)
            LIMIT 1
        )
),

extents AS (
    SELECT
        parent_land_id,
        parent_land_type,
        ST_Union(geom) AS geom
    FROM parent_faces
    GROUP BY parent_land_id, parent_land_type
)

SELECT
    extents.parent_land_id AS land_id,
    extents.parent_land_type AS land_type,
    '{{ child_type }}' AS child_land_type,
    (
        SELECT count(*)
        FROM members
        WHERE members.parent_land_id = extents.parent_land_id
            AND members.parent_land_type = extents.parent_land_type
            AND members.is_straddling
    ) AS straddling_count,
    ST_Area(extents.geom) AS surface,
    ST_Multi(ST_Boundary(extents.geom)) AS geom
FROM extents
