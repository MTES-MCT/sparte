{{
    config(
        materialized="table",
    )
}}

{#-
    Sols artificialisés pour les tuiles de la carte nationale (fichier
    `sols_artificialises_national.pmtiles`, produit par le DAG
    `create_sols_artificialises_national_vector_tiles`) : la part artificialisée de mailles
    carrées, d'après l'OCS GE au dernier millésime de chaque département.

    Pourquoi des mailles et non les objets OCS GE : à l'échelle du pays, d'une région ou d'un
    département, un objet fait moins d'un pixel, et les tuiles des diagnostics pèsent 12 à
    15 Mo chacune aux zooms 4 à 9 pour un seul département (mesuré). Une carte « artificialisé
    ou non » vue de loin, c'est la proportion des deux natures de sol en chaque point : la
    part artificialisée de la maille, une valeur relative, qui se lit en aplat de couleur.

    Le modèle empile plusieurs résolutions de la même grille (voir
    `carroyage_artif_resolutions_m`), une par plage de zooms du fichier de tuiles. Toutes
    portent la même grandeur sous le même attribut `part_artif` : les classes et la légende de
    la carte valent à toutes les résolutions.

    La part rapporte la surface artificialisée à la surface que l'OCS GE couvre dans la
    maille, et non à la maille entière : une maille à cheval sur la mer ou sur la limite de la
    couverture n'est pas diluée. Là où l'OCS GE ne couvre rien, il n'y a pas de maille, ce que
    la carte montre comme une absence de donnée et non comme un sol non artificialisé.

    Les millésimes diffèrent d'un département à l'autre : chaque maille porte l'année de ses
    objets (`annee_min` et `annee_max`, différentes pour une maille à cheval sur deux
    départements qui n'ont pas le même millésime).

    Les mailles d'outre-mer existent deux fois : à leur position réelle (`placement` vaut
    'reel'), pour l'affichage d'une région, d'un département ou d'un EPCI, et déplacées près
    de l'Hexagone selon `national_map_drom_placement` ('cartouche'), pour la France entière,
    comme les communes de `for_vector_tiles_communes_national`. L'Hexagone et la Corse n'ont
    qu'une position : `placement` y est NULL.
-#}

{%- set resolutions_m = carroyage_artif_resolutions_m() -%}
{%- set cell_size_m = resolutions_m | first %}

WITH mailles AS MATERIALIZED (
    -- MATERIALIZED : la jointure aux communes est faite une fois, et non pour chaque résolution
    SELECT
        mailles_commune.srid,
        mailles_commune.x,
        mailles_commune.y,
        mailles_commune.year,
        mailles_commune.surface_artif,
        mailles_commune.surface_totale,
        mailles_commune.departement,
        commune.region,
        commune.epci
    FROM
        {{ ref('artif_carroyage_commune') }} AS mailles_commune
    INNER JOIN
        {{ ref('commune') }} AS commune
        ON commune.code = mailles_commune.commune_code
),

mailles_par_resolution AS (
    -- Chaque maille fine est rattachée, pour chaque résolution, au bloc qui la contient : les
    -- blocs sont alignés sur la grille fine, et ceux de la première résolution sont les
    -- mailles elles-mêmes
    SELECT
        resolutions.resolution_m,
        FLOOR(mailles.x::numeric * {{ cell_size_m }} / resolutions.resolution_m)::int AS bloc_x,
        FLOOR(mailles.y::numeric * {{ cell_size_m }} / resolutions.resolution_m)::int AS bloc_y,
        mailles.*
    FROM
        mailles
    CROSS JOIN
        (VALUES {% for resolution_m in resolutions_m %}({{ resolution_m }}){{ ", " if not loop.last }}{% endfor %}) AS resolutions (resolution_m)
),

blocs AS (
    SELECT
        srid,
        resolution_m,
        bloc_x,
        bloc_y,
        -- Un entier de 0 à 100 : il pèse moins qu'un flottant dans une tuile, et la carte
        -- classe et affiche des pourcentages entiers
        ROUND((100 * SUM(surface_artif) / SUM(surface_totale))::numeric)::int AS part_artif,
        MIN(year) AS annee_min,
        MAX(year) AS annee_max,
        ARRAY_AGG(DISTINCT region ORDER BY region) AS region_codes,
        ARRAY_AGG(DISTINCT departement ORDER BY departement) AS departement_codes,
        -- La liste des EPCI n'est écrite qu'aux résolutions où la carte filtre sur un EPCI
        CASE
            WHEN resolution_m <= {{ carroyage_artif_epci_max_resolution_m() }}
                THEN ARRAY_AGG(DISTINCT epci ORDER BY epci) FILTER (WHERE epci IS NOT NULL)
        END AS epci_codes
    FROM
        mailles_par_resolution
    GROUP BY
        srid,
        resolution_m,
        bloc_x,
        bloc_y
),

blocs_traces AS (
    -- Carré du bloc dans la projection de son territoire, et placement de sa région si elle
    -- est d'outre-mer. Un bloc d'outre-mer n'a qu'une région : chaque DROM a sa projection.
    SELECT
        blocs.*,
        (blocs.resolution_m || 'm' || blocs.srid || 'E' || blocs.bloc_x || 'N' || blocs.bloc_y)::varchar AS id,
        {{ carroyage_artif_block_envelope('blocs.bloc_x', 'blocs.bloc_y', 'blocs.resolution_m', 'blocs.srid') }} AS envelope,
        placement.region_code AS drom_region_code,
        placement.scale_factor,
        placement.x_offset,
        placement.y_offset
    FROM
        blocs
    LEFT JOIN
        {{ ref('national_map_drom_placement') }} AS placement
        ON placement.region_code = blocs.region_codes[1]
)

-- Position réelle de toutes les mailles
SELECT
    id,
    resolution_m,
    part_artif,
    annee_min,
    annee_max,
    CASE WHEN drom_region_code IS NOT NULL THEN 'reel' END AS placement,
    -- Les quatre coins suffisent : entre deux coins, le bord tracé s'écarte de moins d'un
    -- mètre du bord exact de la grille
    ST_Transform(envelope, 4326) AS geom,
    region_codes AS "{{ var('REGION') }}",
    departement_codes AS "{{ var('DEPARTEMENT') }}",
    epci_codes AS "{{ var('EPCI') }}"
FROM
    blocs_traces

UNION ALL

-- Mailles d'outre-mer déplacées près de l'Hexagone
SELECT
    (id || '-cartouche')::varchar AS id,
    resolution_m,
    part_artif,
    annee_min,
    annee_max,
    'cartouche' AS placement,
    ST_Transform(
        {{ national_map_apply_drom_placement('ST_Transform(envelope, 3857)', 'blocs_traces') }},
        4326
    ) AS geom,
    region_codes AS "{{ var('REGION') }}",
    departement_codes AS "{{ var('DEPARTEMENT') }}",
    epci_codes AS "{{ var('EPCI') }}"
FROM
    blocs_traces
WHERE
    drom_region_code IS NOT NULL
