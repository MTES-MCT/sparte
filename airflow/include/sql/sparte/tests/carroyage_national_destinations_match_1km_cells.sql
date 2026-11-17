/*
Ce test vérifie que chaque carroyage par destination de la carte nationale conserve la
consommation de sa destination, carreau par carreau et bloc par bloc : c'est le test
`carroyage_national_blocks_match_1km_cells` (mêmes contrôles, mêmes tolérances), appliqué à
chaque modèle `for_vector_tiles_carroyage_national_<destination>` et à la colonne de la
source qui lui correspond. Un modèle qui lirait la colonne d'une autre destination y échoue.

Le test retourne, avec leur destination, les carreaux et les blocs absents du modèle, ceux
qui ne regroupent aucun carreau d'origine et ceux dont la consommation d'une année s'écarte
de plus que l'arrondi.
*/

{% for destination in carroyage_national_destinations() %}
SELECT
    '{{ destination }}' AS destination,
    ecarts.*
FROM (
    {{ carroyage_national_blocks_mismatching_1km_cells(ref('for_vector_tiles_carroyage_national_' ~ destination), destination) }}
) AS ecarts
{{ "UNION ALL" if not loop.last }}
{% endfor %}
