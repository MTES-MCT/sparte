/*
    Dans les tuiles des sols artificialisés de la carte nationale, chaque maille d'outre-mer
    existe deux fois, avec les mêmes valeurs : à sa position réelle et déplacée dans le
    cartouche de sa région, selon `national_map_drom_placement`. L'Hexagone et la Corse n'ont
    que des mailles à leur position réelle, sans placement.

    Le test retourne :
    - les mailles d'outre-mer sans copie déplacée, et les copies sans maille d'origine ;
    - les copies dont la part artificialisée, la résolution ou les années diffèrent ;
    - les copies dont le centre n'est pas celui de la maille d'origine déplacée (à plus d'un
      mètre), ou dont la surface n'est pas celle d'origine multipliée par le carré du facteur
      d'échelle (à plus d'un millième) ;
    - les mailles de l'Hexagone ou de la Corse qui portent un placement, et celles
      d'outre-mer qui n'en portent pas.
*/

{%- set drom_region_codes = national_map_drom_regions().keys() | list %}

WITH tuiles AS (
    SELECT
        *,
        "{{ var('REGION') }}"[1] AS region_code,
        ST_Transform(geom, 3857) AS geom_3857
    FROM
        {{ ref('for_vector_tiles_sols_artificialises_national') }}
),

reelles AS (
    SELECT * FROM tuiles WHERE placement = 'reel'
),

deplacees AS (
    SELECT * FROM tuiles WHERE placement = 'cartouche'
)

SELECT
    COALESCE(reelles.id, deplacees.id) AS id,
    CASE
        WHEN deplacees.id IS NULL THEN 'maille d''outre-mer sans copie déplacée'
        WHEN reelles.id IS NULL THEN 'copie sans maille d''origine'
        ELSE 'copie différente de sa maille d''origine'
    END AS ecart
FROM
    reelles
FULL JOIN
    deplacees
    ON deplacees.id = reelles.id || '-cartouche'
LEFT JOIN
    {{ ref('national_map_drom_placement') }} AS placement
    ON placement.region_code = reelles.region_code
WHERE
    reelles.id IS NULL
    OR deplacees.id IS NULL
    OR placement.region_code IS NULL
    OR deplacees.resolution_m != reelles.resolution_m
    OR deplacees.part_artif != reelles.part_artif
    OR deplacees.annee_min != reelles.annee_min
    OR deplacees.annee_max != reelles.annee_max
    OR ST_Distance(
        ST_Centroid(deplacees.geom_3857),
        ST_Centroid({{ national_map_apply_drom_placement('reelles.geom_3857', 'placement') }})
    ) > 1
    OR ABS(
        ST_Area(deplacees.geom_3857) / NULLIF(ST_Area(reelles.geom_3857) * placement.scale_factor * placement.scale_factor, 0) - 1
    ) > 0.001

UNION ALL

SELECT
    id,
    CASE
        WHEN placement IS NULL THEN 'maille d''outre-mer sans placement'
        ELSE 'maille de l''Hexagone ou de la Corse avec un placement'
    END AS ecart
FROM
    tuiles
WHERE
    (region_code IN ({% for code in drom_region_codes %}'{{ code }}'{{ ", " if not loop.last }}{% endfor %})) != (placement IS NOT NULL)
