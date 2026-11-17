/*
    Les tuiles des sols artificialisés de la carte nationale disent, à chaque résolution, ce
    que disent les mailles fines : la part artificialisée d'un bloc est la surface
    artificialisée de ses mailles rapportée à leur surface couverte.

    Le test recalcule chaque bloc attendu à partir de `artif_carroyage_commune`, sans passer
    par les communes ni par le placement des DROM, et le compare aux mailles à leur position
    réelle. Il retourne :
    - les blocs attendus mais absents du modèle. Une résolution de
      `carroyage_artif_resolutions_m()` que le modèle ne produirait pas y figure en entier :
      ses zooms seraient vides sur la carte ;
    - ceux du modèle qui ne regroupent aucune maille fine ;
    - ceux dont la part artificialisée s'écarte de plus d'un point (l'arrondi), ou dont les
      années de millésime diffèrent.
*/

{%- set resolutions_m = carroyage_artif_resolutions_m() -%}
{%- set cell_size_m = resolutions_m | first %}

WITH attendus AS (
    SELECT
        (
            resolutions.resolution_m
            || 'm' || mailles.srid
            || 'E' || FLOOR(mailles.x::numeric * {{ cell_size_m }} / resolutions.resolution_m)::int
            || 'N' || FLOOR(mailles.y::numeric * {{ cell_size_m }} / resolutions.resolution_m)::int
        ) AS id,
        resolutions.resolution_m,
        100 * SUM(mailles.surface_artif) / SUM(mailles.surface_totale) AS part_artif,
        MIN(mailles.year) AS annee_min,
        MAX(mailles.year) AS annee_max
    FROM
        {{ ref('artif_carroyage_commune') }} AS mailles
    CROSS JOIN
        (VALUES {% for resolution_m in resolutions_m %}({{ resolution_m }}){{ ", " if not loop.last }}{% endfor %}) AS resolutions (resolution_m)
    GROUP BY
        1,
        2
),

calcules AS (
    SELECT *
    FROM
        {{ ref('for_vector_tiles_sols_artificialises_national') }}
    WHERE
        placement IS DISTINCT FROM 'cartouche'
)

SELECT
    COALESCE(attendus.id, calcules.id) AS id,
    CASE
        WHEN calcules.id IS NULL THEN 'absent du modèle'
        WHEN attendus.id IS NULL THEN 'sans maille fine'
        WHEN calcules.resolution_m != attendus.resolution_m THEN 'résolution différente'
        WHEN ABS(calcules.part_artif - attendus.part_artif) > 1 THEN 'part artificialisée différente'
        ELSE 'millésimes différents'
    END AS ecart,
    attendus.part_artif AS part_artif_attendue,
    calcules.part_artif AS part_artif_calculee
FROM
    attendus
FULL JOIN
    calcules
    ON calcules.id = attendus.id
WHERE
    attendus.id IS NULL
    OR calcules.id IS NULL
    OR calcules.resolution_m != attendus.resolution_m
    OR ABS(calcules.part_artif - attendus.part_artif) > 1
    OR calcules.annee_min != attendus.annee_min
    OR calcules.annee_max != attendus.annee_max
