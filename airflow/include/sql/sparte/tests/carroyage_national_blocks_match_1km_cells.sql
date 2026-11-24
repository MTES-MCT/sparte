/*
Ce test vérifie que le carroyage de la carte nationale conserve la consommation, carreau par
carreau et bloc par bloc. Il recalcule, à partir des carreaux de 1 km d'origine, la
consommation de chaque carreau ou bloc attendu à chaque résolution, et la compare à celle du
modèle : sa densité (m² par km²) multipliée par la surface du bloc (km²).

Les densités sont arrondies à l'entier : un bloc peut s'écarter de 0,5 m² par km², soit
0,5 × sa surface. À 1 km, où rien n'est divisé, l'égalité est exacte. Le total national de
chaque résolution égale donc celui des carreaux de 1 km, à ces arrondis près.

Le test retourne :
- les carreaux et les blocs attendus mais absents du modèle. Une résolution de
  `carroyage_national_resolutions_km()` que le modèle ne produirait pas y figure en entier :
  ses zooms seraient vides sur la carte ;
- ceux du modèle qui ne regroupent aucun carreau d'origine ;
- ceux dont la consommation d'une année s'écarte de plus que l'arrondi.
*/

{{ carroyage_national_blocks_mismatching_1km_cells(ref('for_vector_tiles_carroyage_national')) }}
