/*
Ce test vérifie que les carreaux de 1 km du carroyage de la carte nationale sont ceux de la
source, au même endroit. Le modèle ne reprend pas leur géométrie : il la recalcule à partir de
l'identifiant, en supposant que celui-ci donne, en km, le coin sud-ouest du carreau dans
EPSG:3035. Si une livraison changeait cette convention, toute la carte serait décalée sans
qu'un autre test le voie : ils comparent le modèle à ses identifiants, pas au tracé d'origine.

Le test retourne les carreaux de 1 km du modèle absents de la source sous le même identifiant,
ou dont le tracé s'écarte de celui de la source de plus de 0,00001° (environ un mètre).
*/

SELECT
    calcules.idcarreau
FROM
    {{ ref('for_vector_tiles_carroyage_national') }} AS calcules
LEFT JOIN
    {{ ref('for_vector_tiles_carroyage_lea') }} AS origine
    ON origine.idcarreau = calcules.idcarreau
WHERE
    calcules.resolution_km = 1
    AND (
        origine.idcarreau IS NULL
        OR ST_HausdorffDistance(calcules.geom, origine.geom) > 0.00001
    )
