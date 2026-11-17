/*
    Le découpage des objets OCS GE en mailles conserve les surfaces de chaque commune : la
    carte « sols artificialisés » de la carte nationale dit la même chose que les tables
    d'artificialisation des diagnostics.

    Pour chaque commune, au dernier millésime de son département, le test compare la somme de
    ses mailles (`artif_carroyage_commune`) :
    - en surface artificialisée, à `artif_commune` ;
    - en surface couverte par l'OCS GE, à `commune_couverture_et_usage`.

    Tolérance : 0,1 % de la surface attendue, et 10 m² au moins. Les objets à cheval sur
    plusieurs mailles sont découpés par une intersection exacte, les autres versent leur
    surface telle quelle. Ce test a relevé les erreurs de ST_ClipByBox2D, employée par une
    première version du modèle : 35 communes y perdaient ou gagnaient une maille entière.

    Le test retourne les communes dont l'une des deux surfaces s'écarte davantage, celles de
    l'OCS GE qui n'ont aucune maille, et celles qui ont des mailles sans objet OCS GE.
*/

WITH dernier_millesime AS (
    SELECT
        departement,
        MAX(index) AS index
    FROM
        {{ ref('millesimes') }}
    GROUP BY
        departement
),

surface_totale_attendue AS (
    SELECT
        stock.commune_code,
        SUM(stock.surface) AS surface_totale
    FROM
        {{ ref('commune_couverture_et_usage') }} AS stock
    INNER JOIN
        dernier_millesime
        ON
            dernier_millesime.departement = stock.departement
            AND dernier_millesime.index = stock.index
    GROUP BY
        stock.commune_code
),

surface_artif_attendue AS (
    SELECT
        stock.code AS commune_code,
        SUM(stock.surface) AS surface_artif
    FROM
        {{ ref('artif_commune') }} AS stock
    INNER JOIN
        dernier_millesime
        ON
            dernier_millesime.departement = stock.departement
            AND dernier_millesime.index = stock.index
    GROUP BY
        stock.code
),

attendues AS (
    -- Une commune sans aucun objet artificialisé n'a pas de ligne dans `artif_commune`
    SELECT
        surface_totale_attendue.commune_code,
        surface_totale_attendue.surface_totale,
        COALESCE(surface_artif_attendue.surface_artif, 0) AS surface_artif
    FROM
        surface_totale_attendue
    LEFT JOIN
        surface_artif_attendue
        ON surface_artif_attendue.commune_code = surface_totale_attendue.commune_code
),

calculees AS (
    SELECT
        commune_code,
        SUM(surface_artif) AS surface_artif,
        SUM(surface_totale) AS surface_totale
    FROM
        {{ ref('artif_carroyage_commune') }}
    GROUP BY
        commune_code
)

SELECT
    COALESCE(attendues.commune_code, calculees.commune_code) AS commune_code,
    CASE
        WHEN calculees.commune_code IS NULL THEN 'commune sans maille'
        WHEN attendues.commune_code IS NULL THEN 'mailles sans objet OCS GE'
        ELSE 'surface différente'
    END AS ecart,
    attendues.surface_artif AS surface_artif_attendue,
    calculees.surface_artif AS surface_artif_calculee,
    attendues.surface_totale AS surface_totale_attendue,
    calculees.surface_totale AS surface_totale_calculee
FROM
    attendues
FULL JOIN
    calculees
    ON calculees.commune_code = attendues.commune_code
WHERE
    attendues.commune_code IS NULL
    OR calculees.commune_code IS NULL
    OR ABS(calculees.surface_artif - attendues.surface_artif) > GREATEST(10, 0.001 * attendues.surface_artif)
    OR ABS(calculees.surface_totale - attendues.surface_totale) > GREATEST(10, 0.001 * attendues.surface_totale)
