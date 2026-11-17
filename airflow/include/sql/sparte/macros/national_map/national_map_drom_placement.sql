{% macro national_map_drom_placement(regions) %}
{#
    Placement des régions d'outre-mer près de l'Hexagone, pour la carte nationale.

    En Web Mercator (EPSG:3857) les DROM sont à des milliers de kilomètres de l'Hexagone.
    Pour tenir sur une seule vue, chacun est posé au centre d'un emplacement fixe, dans les
    espaces maritimes à l'ouest de l'Hexagone : les quatre îles en grille au large de la
    Bretagne et de la Manche, la Guyane dans le golfe de Gascogne. Il y est ramené à
    l'échelle de l'Hexagone : Web Mercator étire les longueurs de 1 / cos(latitude), un
    territoire tropical y est donc dessiné environ 1,4 fois plus petit qu'un territoire de
    même taille situé à 46° N. Le rapport des cosinus de latitude corrige cet écart, sans
    autre déformation.

    C'est la seconde écriture du calcul de `build_base_map`
    (public_data/domain/national_map.py), qui place les DROM des fonds GeoJSON servis par
    Django : mêmes constantes, mêmes formules. Toute modification doit être faite des deux
    côtés, et dans le jeu d'essai commun aux deux (test singulier
    `national_map_placement_matches_python_on_synthetic_regions`).

    Paramètre `regions` : nom d'une relation ou d'une CTE, avec une ligne par région :
        - region_code : code de la région ;
        - geom : géométrie en EPSG:3857.
    Les régions absentes de `national_map_drom_regions` forment la référence (l'Hexagone et
    la Corse), qui ne bouge pas. Ce nom ne doit pas commencer par `placement_`, préfixe
    réservé aux CTE de la macro.

    Renvoie une requête (utilisable comme corps de CTE) : une ligne par région d'outre-mer
    présente dans `regions`. Colonnes :
        - region_code, name ;
        - scale_factor, x_offset, y_offset : un point (x, y) en EPSG:3857 va en
          (scale_factor * x + x_offset, scale_factor * y + y_offset), ce qu'applique la
          macro `national_map_apply_drom_placement` ;
        - inset_geom : le cartouche, emprise de la région une fois déplacée ;
        - slot_geom : l'emplacement, cellule au centre de laquelle la région est posée ;
        - reference_geom : emprise de l'Hexagone et de la Corse ;
        - separation_geom : polyligne séparant les territoires déplacés de l'Hexagone.
    Les géométries sont en EPSG:3857. `reference_geom` et `separation_geom` ne dépendent pas
    de la région : elles sont identiques sur toutes les lignes.
#}

{%- set drom_regions = national_map_drom_regions() -%}
{%- set drom_codes -%}
    '{{ drom_regions.keys() | join("', '") }}'
{%- endset -%}

{#- Grille des îles, de gauche à droite puis de haut en bas ; la Guyane a son propre emplacement -#}
{%- set islands_grid = [["01", "02"], ["04", "06"]] -%}
{%- set guyane = "03" -%}

{#-
    Emplacements, en proportions de l'emprise de référence (largeur `width`, hauteur
    `height`). La bande ajoutée à gauche reste étroite, pour que l'ensemble garde des
    proportions proches de la zone d'affichage.
-#}
{%- set left_band = 0.2 -%}  {#- largeur ajoutée à gauche de l'Hexagone, en `width` -#}
{#- Îles : au-dessus de la Bretagne, sous le niveau du Cotentin -#}
{%- set islands_x_max = 0.21 -%}  {#- en `width` depuis le bord gauche de l'Hexagone -#}
{%- set islands_height = 0.23 -%}  {#- en `height` depuis le haut -#}
{#- Guyane : golfe de Gascogne, à l'ouest des côtes atlantiques -#}
{%- set guyane_x_max = 0.165 -%}  {#- en `width` depuis le bord gauche de l'Hexagone -#}
{%- set guyane_height = 0.5 -%}  {#- en `height` depuis le bas -#}

{#-
    Ligne de séparation : une seule polyligne, du haut vers le bas, qui contourne la pointe
    bretonne par l'ouest. Points en (x en `width` depuis le bord gauche, y en `height` depuis
    le bas) de l'emprise de référence.
-#}
{%- set separation = [
    [0.20, 1.03],
    [0.20, 0.80],
    [-0.04, 0.76],
    [-0.04, 0.61],
    [0.16, 0.51],
    [0.16, -0.01],
] -%}

WITH placement_reference_extent AS (
    -- Emprise commune de l'Hexagone et de la Corse
    SELECT
        min(ST_XMin(geom)) AS x_min,
        min(ST_YMin(geom)) AS y_min,
        max(ST_XMax(geom)) AS x_max,
        max(ST_YMax(geom)) AS y_max
    FROM {{ regions }}
    WHERE region_code NOT IN ({{ drom_codes }})
),

placement_reference AS (
    SELECT
        x_min,
        y_min,
        x_max,
        y_max,
        x_max - x_min AS width,
        y_max - y_min AS height,
        -- Bord gauche de la bande ajoutée à l'ouest de l'Hexagone
        x_min - {{ left_band }} * (x_max - x_min) AS left_x
    FROM placement_reference_extent
),

placement_cells AS (
    SELECT
        *,
        (x_min + {{ islands_x_max }} * width - left_x) / {{ islands_grid[0] | length }} AS cell_width,
        {{ islands_height }} * height / {{ islands_grid | length }} AS cell_height
    FROM placement_reference
),

placement_slots AS (
    {% for row in islands_grid -%}
    {%- set row_index = loop.index0 -%}
    {%- for region_code in row -%}
    SELECT
        '{{ region_code }}' AS region_code,
        left_x + {{ loop.index0 }} * cell_width AS x_min,
        y_max - {{ row_index }} * cell_height - cell_height AS y_min,
        left_x + {{ loop.index0 }} * cell_width + cell_width AS x_max,
        y_max - {{ row_index }} * cell_height AS y_max
    FROM placement_cells
    UNION ALL
    {% endfor -%}
    {%- endfor -%}
    SELECT
        '{{ guyane }}' AS region_code,
        left_x AS x_min,
        y_min,
        x_min + {{ guyane_x_max }} * width AS x_max,
        y_min + {{ guyane_height }} * height AS y_max
    FROM placement_cells
),

placement_sources AS (
    -- Emprise de chaque région d'outre-mer, à sa position réelle
    SELECT
        region_code,
        min(ST_XMin(geom)) AS x_min,
        min(ST_YMin(geom)) AS y_min,
        max(ST_XMax(geom)) AS x_max,
        max(ST_YMax(geom)) AS y_max
    FROM {{ regions }}
    WHERE region_code IN ({{ drom_codes }})
    GROUP BY region_code
),

placement_moves AS (
    SELECT
        sources.region_code,
        -- Les latitudes sont celles du milieu de chaque emprise
        {{ national_map_mercator_latitude_cosine('(sources.y_min + sources.y_max) / 2') }}
        / {{ national_map_mercator_latitude_cosine('(reference.y_min + reference.y_max) / 2') }} AS scale_factor,
        (sources.x_min + sources.x_max) / 2 AS source_x,
        (sources.y_min + sources.y_max) / 2 AS source_y,
        sources.x_max - sources.x_min AS source_width,
        sources.y_max - sources.y_min AS source_height,
        (slots.x_min + slots.x_max) / 2 AS target_x,
        (slots.y_min + slots.y_max) / 2 AS target_y,
        ST_MakeEnvelope(slots.x_min, slots.y_min, slots.x_max, slots.y_max, 3857) AS slot_geom,
        ST_MakeEnvelope(reference.x_min, reference.y_min, reference.x_max, reference.y_max, 3857) AS reference_geom,
        ST_SetSRID(
            ST_MakeLine(ARRAY[
                {% for x, y in separation -%}
                ST_MakePoint(reference.x_min + ({{ x }}) * reference.width, reference.y_min + ({{ y }}) * reference.height)
                {{- "," if not loop.last }}
                {% endfor -%}
            ]),
            3857
        ) AS separation_geom
    FROM placement_sources AS sources
    JOIN placement_slots AS slots
        ON slots.region_code = sources.region_code
    CROSS JOIN placement_reference AS reference
)

SELECT
    moves.region_code,
    names.name,
    moves.scale_factor,
    -- Le centre de l'emprise de la région arrive au centre de son emplacement
    moves.target_x - moves.source_x * moves.scale_factor AS x_offset,
    moves.target_y - moves.source_y * moves.scale_factor AS y_offset,
    ST_MakeEnvelope(
        moves.target_x - moves.source_width * moves.scale_factor / 2,
        moves.target_y - moves.source_height * moves.scale_factor / 2,
        moves.target_x + moves.source_width * moves.scale_factor / 2,
        moves.target_y + moves.source_height * moves.scale_factor / 2,
        3857
    ) AS inset_geom,
    moves.slot_geom,
    moves.reference_geom,
    moves.separation_geom
FROM placement_moves AS moves
JOIN (
    VALUES
    {% for region_code, name in drom_regions.items() -%}
    ('{{ region_code }}', '{{ name }}'){{ "," if not loop.last }}
    {% endfor -%}
) AS names (region_code, name)
    ON names.region_code = moves.region_code
{% endmacro %}


{% macro national_map_mercator_latitude_cosine(y) -%}
{#-
    Cosinus de la latitude d'une ordonnée Web Mercator `y`, en mètres. La latitude vaut
    atan(sinh(y / R)), R étant le rayon de la sphère de Web Mercator.
-#}
cos(atan(sinh(({{ y }}) / 6378137.0)))
{%- endmacro %}
