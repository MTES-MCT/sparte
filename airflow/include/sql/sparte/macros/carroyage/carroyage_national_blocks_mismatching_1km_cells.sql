{#-
    Requête des tests de conservation du carroyage de la carte nationale : les carreaux et
    les blocs de `model` qui ne retrouvent pas la consommation des carreaux de 1 km de la
    source, pour la consommation totale (`destination` absent) ou pour une destination de
    `carroyage_national_destinations()`.

    Ce que la requête retourne et ses tolérances sont décrits dans le test
    `carroyage_national_blocks_match_1km_cells`.
-#}
{% macro carroyage_national_blocks_mismatching_1km_cells(model, destination=none) %}
{%- set years = carroyage_national_years() -%}
{%- set resolutions_km = carroyage_national_resolutions_km() -%}

WITH carreaux_par_bloc AS (
    -- Chaque carreau d'origine, avec l'identifiant du bloc qui le contient à chaque résolution.
    -- La division entière ramène le coin sud-ouest du carreau au multiple inférieur du côté.
    SELECT
        resolutions.resolution_km,
        resolutions.resolution_km
        || 'kmN' || ({{ carroyage_national_id_coordinate_km('carreaux.idcarreau', 'N') }} / resolutions.resolution_km * resolutions.resolution_km)
        || 'E' || ({{ carroyage_national_id_coordinate_km('carreaux.idcarreau', 'E') }} / resolutions.resolution_km * resolutions.resolution_km)
            AS idcarreau_bloc,
        {% for year in years %}
        {{ carroyage_national_origin_conso(year, destination, 'carreaux') }}{{ "," if not loop.last }}
        {% endfor %}
    FROM
        {{ ref('for_vector_tiles_carroyage_lea') }} AS carreaux
    CROSS JOIN
        (VALUES {% for resolution_km in resolutions_km %}({{ resolution_km }}){{ ", " if not loop.last }}{% endfor %}) AS resolutions (resolution_km)
),

attendus AS (
    SELECT
        resolution_km,
        idcarreau_bloc AS idcarreau,
        resolution_km * resolution_km AS surface_km2,
        {% for year in years %}
        COALESCE(SUM(conso_{{ year }}), 0) AS conso_{{ year }}{{ "," if not loop.last }}
        {% endfor %}
    FROM
        carreaux_par_bloc
    GROUP BY
        resolution_km,
        idcarreau_bloc
    -- Un bloc sans aucune consommation n'est pas dessiné : il n'est pas attendu dans le modèle
    HAVING
        {% for year in years %}
        COALESCE(SUM(conso_{{ year }}), 0){{ " + " if not loop.last }}
        {% endfor %} > 0
)

SELECT
    COALESCE(attendus.idcarreau, calcules.idcarreau) AS idcarreau,
    CASE
        WHEN calcules.idcarreau IS NULL THEN 'absent du modèle'
        WHEN attendus.idcarreau IS NULL THEN 'sans carreau d''origine'
        ELSE 'consommation différente'
    END AS ecart
FROM
    attendus
FULL JOIN
    {{ model }} AS calcules
    ON
        calcules.idcarreau = attendus.idcarreau
        AND calcules.resolution_km = attendus.resolution_km
WHERE
    attendus.idcarreau IS NULL
    OR calcules.idcarreau IS NULL
    {% for year in years %}
    OR ABS(COALESCE(calcules.conso_{{ year }}, 0)::bigint * attendus.surface_km2 - attendus.conso_{{ year }}) > 0.5 * attendus.surface_km2
    {% endfor %}
{% endmacro %}
