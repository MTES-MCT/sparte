/*
    Dans le carroyage des sols artificialisés, une maille ne contient pas plus que sa propre
    surface, et jamais plus d'artificialisé que de surface couverte : un objet compté deux
    fois, ou versé dans la mauvaise maille, fausserait la part artificialisée affichée.

    Le test retourne :
    - les lignes dont la surface artificialisée dépasse la surface couverte ;
    - les mailles dont la surface couverte, toutes communes confondues, dépasse le carré de
      leur côté. Tolérance d'un millième : les communes sont découpées séparément, et leurs
      limites se recouvrent parfois de quelques mètres carrés.
*/

{%- set cell_size_m = carroyage_artif_resolutions_m() | first %}

SELECT
    srid,
    x,
    y,
    commune_code,
    'plus d''artificialisé que de surface couverte' AS ecart,
    surface_artif,
    surface_totale
FROM
    {{ ref('artif_carroyage_commune') }}
WHERE
    surface_artif > surface_totale * 1.001 + 1

UNION ALL

SELECT
    srid,
    x,
    y,
    NULL AS commune_code,
    'maille plus remplie que sa surface' AS ecart,
    SUM(surface_artif) AS surface_artif,
    SUM(surface_totale) AS surface_totale
FROM
    {{ ref('artif_carroyage_commune') }}
GROUP BY
    srid,
    x,
    y
HAVING
    SUM(surface_totale) > {{ cell_size_m }} * {{ cell_size_m }} * 1.001
