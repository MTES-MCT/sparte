/*
Ce test vérifie que les carroyages par destination de la carte nationale ne dessinent que
des carreaux et des blocs du carroyage total, au même endroit : la carte passe d'un fichier
de tuiles à l'autre sans changer ni de grille ni de filtre géographique.

Chaque carreau ou bloc d'une destination doit exister dans `for_vector_tiles_carroyage_national`
sous le même identifiant, avec la même résolution, les mêmes régions et exactement le même
tracé. Une destination peut en avoir moins que le total (elle n'est pas présente partout),
jamais d'autres : la source n'a aucun carreau où une destination est consommée sans que le
total le soit. Le tracé n'est donc pas contrôlé une seconde fois : celui du total l'est par
`carroyage_national_geom_matches_idcarreau` et `carroyage_national_1km_cells_match_origin_geom`.

Le test retourne, avec leur destination, les carreaux et les blocs absents du total ou qui
en diffèrent.
*/

{% for destination in carroyage_national_destinations() %}
SELECT
    '{{ destination }}' AS destination,
    par_destination.idcarreau,
    CASE
        WHEN total.idcarreau IS NULL THEN 'absent du total'
        WHEN total.resolution_km <> par_destination.resolution_km THEN 'résolution différente'
        WHEN total."{{ var('REGION') }}" IS DISTINCT FROM par_destination."{{ var('REGION') }}" THEN 'régions différentes'
        ELSE 'tracé différent'
    END AS ecart
FROM
    {{ ref('for_vector_tiles_carroyage_national_' ~ destination) }} AS par_destination
LEFT JOIN
    {{ ref('for_vector_tiles_carroyage_national') }} AS total
    ON total.idcarreau = par_destination.idcarreau
WHERE
    total.idcarreau IS NULL
    OR total.resolution_km <> par_destination.resolution_km
    OR total."{{ var('REGION') }}" IS DISTINCT FROM par_destination."{{ var('REGION') }}"
    OR NOT ST_OrderingEquals(total.geom, par_destination.geom)
{{ "UNION ALL" if not loop.last }}
{% endfor %}
