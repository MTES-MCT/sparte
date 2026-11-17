{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["commune_code"], "type": "btree"},
            {"columns": ["srid", "x", "y"], "type": "btree"},
        ],
    )
}}

{#-
    Surface artificialisée et surface couverte par l'OCS GE dans chaque maille carrée d'une
    grille fine (voir `carroyage_artif_resolutions_m`, première valeur), commune par commune,
    au dernier millésime de chaque département.

    C'est la base de la carte « sols artificialisés » de la carte nationale : à l'échelle du
    pays ou d'une région, un objet OCS GE fait bien moins d'un pixel, et les tuiles des
    diagnostics (un fichier de 120 Mo par département en médiane) ne peuvent pas être
    chargées. Le modèle `for_vector_tiles_sols_artificialises_national` regroupe ces mailles
    en blocs de plus en plus grands.

    La grille est celle de la projection d'origine de chaque territoire (`srid`) : Lambert-93
    en métropole, une projection UTM par DROM. La maille (x, y) couvre le carré dont le coin
    sud-ouest est (x × côté, y × côté).

    Une ligne par commune et par maille, et non par maille : la somme d'une commune se compare
    ainsi aux tables d'artificialisation des diagnostics (test
    `artif_carroyage_commune_matches_ocsge_stock`), et les territoires d'une maille (région,
    département, EPCI) se déduisent de ses communes.

    Découpage : chaque objet est croisé avec les mailles que recoupe son emprise. Un objet
    contenu dans une seule maille (un peu plus de la moitié des objets, mesuré sur une
    centaine de communes du Jura) y verse sa surface sans calcul géométrique ; les autres sont
    découpés par le carré de chaque maille.

    Le découpage est une intersection exacte (ST_Intersection), et non ST_ClipByBox2D : plus
    rapide, cette dernière ajoute ou retire une maille entière sur certains polygones troués
    (GEOS 3.13.1). Une première construction du pays avec elle faussait environ 120 mailles,
    que les deux tests du modèle ont relevées.

    La requête est écrite pour être exécutée en parallèle : le pays est calculé en 1 h 45 sur
    dix processus (mesuré le 13 novembre 2026), contre 4 h 30 sur un seul avec le découpage
    rapide. Deux conditions pour cela :
    - la table des objets n'est lue qu'une fois, sans expression de table lue par plusieurs
      branches, pour que son parcours soit réparti entre plusieurs processus ;
    - `morceaux` est MATERIALIZED : les surfaces sont ainsi calculées dans ces processus.
      Sans cela, le calcul est repoussé dans l'agrégation, qui trie d'abord les géométries.
-#}

{%- set cell_size_m = carroyage_artif_resolutions_m() | first %}

WITH dernier_millesime AS (
    SELECT
        departement,
        MAX(index) AS index
    FROM
        {{ ref('millesimes') }}
    GROUP BY
        departement
),

morceaux AS MATERIALIZED (
    SELECT
        ocsge.commune_code,
        ocsge.departement,
        ocsge.year,
        ocsge.srid_source AS srid,
        colonnes.x,
        lignes.y,
        ocsge.is_artificial,
        CASE
            WHEN emprise.x_min = emprise.x_max AND emprise.y_min = emprise.y_max
                THEN ocsge.surface
            ELSE
                ST_Area(
                    ST_Intersection(
                        ocsge.geom,
                        {{ carroyage_artif_block_envelope('colonnes.x', 'lignes.y', cell_size_m, 'ocsge.srid_source') }}
                    )
                )
        END AS surface
    FROM
        {{ ref('occupation_du_sol_commune') }} AS ocsge
    INNER JOIN
        dernier_millesime
        ON
            dernier_millesime.departement = ocsge.departement
            AND dernier_millesime.index = ocsge.index
    -- Emprise de l'objet, en nombre de mailles
    CROSS JOIN LATERAL (
        SELECT
            FLOOR(ST_XMin(ocsge.geom) / {{ cell_size_m }})::int AS x_min,
            FLOOR(ST_XMax(ocsge.geom) / {{ cell_size_m }})::int AS x_max,
            FLOOR(ST_YMin(ocsge.geom) / {{ cell_size_m }})::int AS y_min,
            FLOOR(ST_YMax(ocsge.geom) / {{ cell_size_m }})::int AS y_max
    ) AS emprise
    CROSS JOIN LATERAL
        generate_series(emprise.x_min, emprise.x_max) AS colonnes (x)
    CROSS JOIN LATERAL
        generate_series(emprise.y_min, emprise.y_max) AS lignes (y)
)

SELECT
    commune_code,
    departement,
    year,
    srid,
    x,
    y,
    COALESCE(SUM(surface) FILTER (WHERE is_artificial), 0) AS surface_artif,
    SUM(surface) AS surface_totale
FROM
    morceaux
GROUP BY
    commune_code,
    departement,
    year,
    srid,
    x,
    y
-- L'emprise d'un objet en biais recoupe des mailles qu'il ne touche pas
HAVING
    SUM(surface) > 0
