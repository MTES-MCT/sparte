{#-
    Requête du carroyage de la carte nationale, commune au modèle de la consommation totale
    (`for_vector_tiles_carroyage_national`, sans argument) et aux modèles par destination
    (`for_vector_tiles_carroyage_national_<destination>`, voir
    `carroyage_national_destinations()`). Seule la colonne lue dans la source change, voir
    `carroyage_national_origin_conso` : résolutions, noms des colonnes `conso_AAAA`, arrondis,
    tracé des blocs et régions sont identiques, si bien que la carte lit ces fichiers de tuiles
    de la même façon et leur applique les mêmes classes.

    Les régions d'un bloc sont celles de tous les carreaux de la source qu'il regroupe, quelle
    que soit la destination : un même bloc porte les mêmes régions dans tous les fichiers.

    Les choix de calcul (densité, valeurs NULL, résolutions empilées) sont expliqués dans le
    modèle `for_vector_tiles_carroyage_national`.
-#}
{% macro carroyage_national_blocs(destination=none) %}
{%- set years = carroyage_national_years() -%}
{%- set resolutions_km = carroyage_national_resolutions_km() -%}

WITH carreaux AS MATERIALIZED (
    -- `idcarreau` vaut « 1kmN<nord>E<est> » : les coordonnées, en km, du coin sud-ouest du
    -- carreau dans la projection EPSG:3035 (ETRS89-LAEA), celle où la grille est carrée.
    -- MATERIALIZED : sans lui, PostgreSQL fond cette CTE dans la suivante et relit
    -- l'identifiant de chaque carreau pour chaque résolution, au lieu d'une seule fois.
    SELECT
        {{ carroyage_national_id_coordinate_km('idcarreau', 'N') }} AS north_km,
        {{ carroyage_national_id_coordinate_km('idcarreau', 'E') }} AS east_km,
        {% for year in years %}
        {{ carroyage_national_origin_conso(year, destination) }},
        {% endfor %}
        "{{ var('REGION') }}" AS region_codes
    FROM
        {{ ref('for_vector_tiles_carroyage_lea') }}
),

carreaux_par_resolution AS (
    -- Chaque carreau est rattaché, pour chaque résolution, au bloc qui le contient. Le coin
    -- sud-ouest du bloc est celui du carreau ramené au multiple inférieur de la résolution :
    -- les blocs sont alignés sur la grille d'origine et ceux de 1 km sont les carreaux eux-mêmes.
    SELECT
        resolutions.resolution_km,
        carreaux.north_km - carreaux.north_km % resolutions.resolution_km AS bloc_north_km,
        carreaux.east_km - carreaux.east_km % resolutions.resolution_km AS bloc_east_km,
        carreaux.*
    FROM
        carreaux
    CROSS JOIN
        (VALUES {% for resolution_km in resolutions_km %}({{ resolution_km }}){{ ", " if not loop.last }}{% endfor %}) AS resolutions (resolution_km)
),

blocs AS (
    SELECT
        resolution_km,
        bloc_north_km,
        bloc_east_km,
        -- Densités en m² par km², arrondies à l'entier : un entier pèse beaucoup moins qu'un
        -- flottant dans une tuile, et 1 m² par km² est très en dessous de la première classe
        {% for year in years %}
        NULLIF(ROUND(SUM(conso_{{ year }})::numeric / (resolution_km * resolution_km)), 0)::int AS conso_{{ year }}{{ "," if not loop.last }}
        {% endfor %}
    FROM
        carreaux_par_resolution
    GROUP BY
        resolution_km,
        bloc_north_km,
        bloc_east_km
    HAVING
        {% for year in years %}
        COALESCE(SUM(conso_{{ year }}), 0){{ " + " if not loop.last }}
        {% endfor %} > 0
),

regions AS (
    -- Régions recoupées par un bloc : l'union de celles de ses carreaux. Calculée à part,
    -- parce que déplier les régions d'un carreau frontalier le compterait deux fois dans
    -- les sommes de consommation.
    SELECT
        resolution_km,
        bloc_north_km,
        bloc_east_km,
        array_agg(DISTINCT region_code ORDER BY region_code) AS region_codes
    FROM
        carreaux_par_resolution
    CROSS JOIN LATERAL
        unnest(region_codes) AS region_code
    GROUP BY
        resolution_km,
        bloc_north_km,
        bloc_east_km
)

SELECT
    -- Même convention que la grille d'origine : « 5kmN2030E4250 » est le bloc de 5 km dont
    -- le coin sud-ouest est à 2 030 km nord et 4 250 km est
    (blocs.resolution_km || 'kmN' || blocs.bloc_north_km || 'E' || blocs.bloc_east_km)::varchar AS idcarreau,
    blocs.resolution_km,
    {% for year in years %}
    blocs.conso_{{ year }},
    {% endfor %}
    -- Les quatre coins suffisent, sans union des géométries des carreaux du bloc : entre deux
    -- coins, le bord tracé s'écarte de moins d'un mètre du bord exact de la grille
    ST_Transform(
        ST_MakeEnvelope(
            blocs.bloc_east_km * 1000,
            blocs.bloc_north_km * 1000,
            (blocs.bloc_east_km + blocs.resolution_km) * 1000,
            (blocs.bloc_north_km + blocs.resolution_km) * 1000,
            3035
        ),
        4326
    ) AS geom,
    regions.region_codes AS "{{ var('REGION') }}"
FROM
    blocs
LEFT JOIN
    regions
    ON
        regions.resolution_km = blocs.resolution_km
        AND regions.bloc_north_km = blocs.bloc_north_km
        AND regions.bloc_east_km = blocs.bloc_east_km
{% endmacro %}
