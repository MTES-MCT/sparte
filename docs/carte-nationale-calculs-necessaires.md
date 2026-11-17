# Carte nationale : calculs de données nécessaires

Dernière mise à jour : 16 novembre 2026.

La carte nationale (`/carte`) ne s'appuie que sur des tables déjà produites par dbt.
Tout ce qui est affiché aujourd'hui est calculé à la volée par Django à partir de ces
tables (voir `public_data/domain/national_map*.py` et les vues
`NationalMap*View` de `public_data/views.py`). Ce document liste ce qui devra être
précalculé côté Airflow/dbt quand ce sera de nouveau possible, et ce qui reste
hors de portée sans ces calculs.

## Ce qui fonctionne sans nouveau calcul

| Besoin | Source existante | Calcul fait par Django |
| --- | --- | --- |
| Fond de carte régions, départements, EPCI, communes | `public_data_land_geojson` (parent NATION, REGION, DEPART ou EPCI) | Déplacement des DROM à échelle réelle, ligne de séparation ; France entière par EPCI obtenue en réunissant les 18 GeoJSON régionaux |
| Consommation sur une période, totale et par destination | `public_data_landconsostats` (toutes les paires d'années 2011-2024) | Conversion en ha, part de la surface (`public_data_land.surface`) |
| Évolution entre les périodes de référence (2011-2020, puis 2021 au dernier millésime) | `public_data_landconsostats` | Rapport des rythmes annuels des deux périodes. Leurs cumuls et leurs moyennes annuelles n'ont ni champ ni carte : c'est la consommation sur la période demandée, et la carte propose ces périodes toutes prêtes dans son sélecteur, d'après `fixed_periods` (en-tête de la réponse `indicators`) |
| Consommation annuelle par destination (graphiques) | graphiques serveur des diagnostics (`chart_determinant`, `pie_determinant`) sur le territoire NATION, REGION, DEPART ou EPCI | L'Hexagone seul n'étant pas un territoire, ses graphiques sont ceux de la France entière |
| Cartes bivariées emplois, ménages, population | `public_data_bivariate_land_rate`, `_conso_threshold`, `_indic_threshold` | Classement 3 × 3 avec les seuils nationaux |

## Précalculs écrits le 12 novembre 2026 (à construire puis à copier)

| Besoin | Réponse |
| --- | --- |
| Fonds trop lourds (régions, départements, EPCI) | Modèle `land_national_map_geom` : `simple_geom` simplifié une seconde fois par la macro `simplify_lands_by_lot` (frontières partagées conservées), tolérances de 3 000, 2 000 et 1 000 m, îlots plus petits que le carré de la tolérance retirés. France par EPCI : de 6,3 Mo à environ 1,2 Mo. |
| Fonds trop lourds à la maille commune | Modèle `land_national_map_commune_geom` : deux géométries par commune, à l'échelle de sa région et de son département. La carte étant une vue fixe, la tolérance vaut un millième de l'emprise du parent (au plus 1 px sur 1 000 px) : 485 m en Nouvelle-Aquitaine, 117 m pour le département médian, 25 m dans les Hauts-de-Seine. Mesuré en lecture seule : communes de Corse de 601 à 247 Ko, du Finistère de 657 à 307 Ko ; estimé : Nouvelle-Aquitaine de 6,0 à environ 2 Mo. |
| Pas de fond France entière par EPCI ; coordonnées à 9 décimales | Modèle `for_app_national_map_geojson` (table `public_data_national_map_geojson`) : uniquement les couples parent / maille affichés par la carte, coordonnées arrondies au mètre. Sous un EPCI les communes gardent `simple_geom` : assez léger (240 Ko au plus), et seul cohérent quand l'EPCI chevauche deux départements ou deux régions. |
| Filtre `parent_keys @> …` sans index dans la base de l'app | Index GIN sur `public_data_land.parent_keys`, créé par `copy_public_data_land` du DAG `update_app`. |
| Carte bivariée habitat × population | Aucun calcul dbt : Django croise le taux de consommation pour l'habitat (lignes ménages) et l'évolution de la population (lignes population), voir `cross_bivariate_rates`. |
| Communes de toute la France (maille commune sur la France entière et l'Hexagone) | Tuiles vectorielles `communes_national.pmtiles`, produites par le DAG `create_communes_national_vector_tiles` depuis le modèle `for_vector_tiles_communes_national`. Les DROM y sont déplacés selon le modèle `national_map_drom_placement`. Voir « Communes de toute la France » plus bas. |

Tant que la table `public_data_national_map_geojson` n'existe pas, la vue se rabat sur
`public_data_land_geojson` (comportement précédent).

Méthode de `simplify_lands_by_lot`, par lot de territoires affichés ensemble : contours
fusionnés en un réseau de lignes, simplifiés d'un bloc, redécoupés en faces ; chaque face
revient au territoire qui en couvre plus de la moitié. Un territoire trop petit pour la
tolérance, qui ne retrouve pas la moitié de sa surface, garde son `simple_geom`
(`is_simplified = false`) : aucun ne disparaît. Les communes partent de `simple_geom` et
sont traitées par région puis par département (18 µs par point mesurés sur des lots de
1 000 à 40 000 points, soit environ 2 minutes estimées pour la France) ; les simplifier
d'un bloc depuis `geom` dépasse dix minutes sur l'entrepôt.

Deux lots voisins ne simplifient pas leur frontière commune de la même façon : entre le
Finistère et les Côtes-d'Armor, 16 jours et 16 recouvrements larges de 124 m au plus sur
97 km. C'est pourquoi une géométrie allégée n'est servie que sous le parent de son lot.

Tests de données (`dbt build` les lance avec les modèles) :

| Test | Ce qu'il détecte |
| --- | --- |
| `national_map_geom_has_all_lands` | Une région, un département, un EPCI ou une commune de `land` sans géométrie allégée |
| `national_map_geom_area_close_to_origin` | Une surface allégée trop éloignée de l'origine (face mal attribuée). Sur la table du 12 novembre, il relève la CC de l'Île de Noirmoutier, réduite à 0,1 % de sa surface par l'ancienne attribution au point intérieur |
| `national_map_geojson_matches_land_children` | Un fond dont le nombre d'entités diffère du nombre d'enfants dans `land`, un fond manquant ou en trop |
| `national_map_geojson_features_are_drawable` | Une entité sans `land_id`, sans géométrie surfacique, ou en double dans son fond |
| Tests des fichiers `.yml` | Géométrie nulle, vide, invalide ou non surfacique ; clé en double |

## Limite du département à la maille EPCI (16 novembre 2026)

Sous un département, la maille EPCI dessine en entier les EPCI à cheval sur plusieurs
départements (89 EPCI sur 1 255 ; 79 départements sur 101 en ont au moins un, jusqu'à 7 pour
la Drôme et les Alpes-de-Haute-Provence) : ils débordent, et rien ne montrait où le
département s'arrête. Toutes les cartes de cette vue redessinent donc sa limite par-dessus,
en tireté sombre sur liseré clair.

**D'où vient le tracé.** Il doit se confondre avec les limites d'EPCI du fond partout où il
les longe, sinon la carte montre deux traits décalés. Aucune géométrie existante ne le
permet : chaque type de territoire est simplifié à part, avec ses propres sommets
(`simple_geom` : 50 m pour les communes, 250 m pour les EPCI, 1 500 m pour les départements ;
`land_national_map_geom` : 1 000 m pour les EPCI, 2 000 m pour les départements ;
`land_national_map_commune_geom` : tolérance propre à chaque parent). Mesuré pour le Rhône :
27 des 48 sommets du département du fond sont aussi des sommets de ses EPCI, les autres
s'en écartent jusqu'à 5,4 km ; 155 des 222 sommets des EPCI se retrouvent dans le fond par
commune. Les fonds partagent donc des sommets (les simplifications gardent des sommets
d'origine), mais pas leurs tracés : on ne peut ni réutiliser le contour du département, ni le
déduire dans le navigateur des fonds qu'il a déjà.

**Modèle `land_national_map_parent_boundary_geom`** (une ligne par département, 3 s pour la
France). La limite est construite sur les EPCI du fond eux-mêmes :

1. les communes (`simple_geom`) d'un EPCI à cheval sont réunies en deux morceaux, dans le
   département et hors de lui ; leur frontière commune est la limite du département à
   l'intérieur de l'EPCI (la coupe), simplifiée avec la tolérance du fond ;
2. chaque bout de coupe est raccordé au contour simplifié de l'EPCI par le plus court
   chemin : seul un point où trois EPCI se rencontrent est gardé tel quel par les
   simplifications (dans le Rhône, 3 bouts sur 8 sont déjà sur le contour, les autres en sont
   à 40-190 m). Coupes et raccords dépassent d'un mètre le point visé, pour que le découpage
   ne dépende pas d'un arrondi ;
3. contours des EPCI du fond, coupes et raccords forment un seul réseau, noué puis redécoupé
   en faces ; une face d'un EPCI à cheval revient au morceau qui la couvre le plus ;
4. la limite est le bord de la réunion des faces du département. Toutes viennent du même
   réseau : la réunion est exacte, et la limite ne quitte les limites d'EPCI que le long des
   coupes. Sans EPCI à cheval (22 départements), c'est le contour extérieur des EPCI.

Les EPCI du fond ne sont pas modifiés : ni `land_national_map_geom` ni les autres fonds ne
sont à reconstruire. Une commune sans EPCI (Ouessant, Sein, Yeu, Bréhat) n'est dans aucune
entité du fond par EPCI : la limite ne l'entoure pas.

**Fond.** `for_app_national_map_geojson` ajoute au GeoJSON du couple département / EPCI le
membre `parent_boundary` : les coordonnées d'un MultiLineString, en EPSG:3857 arrondies au
mètre comme les entités (2,5 Ko en moyenne, 6,8 Ko au plus). Un membre du GeoJSON plutôt
qu'une colonne : la table `public_data_national_map_geojson` et son modèle Django ne
changent pas, et un fond construit avant ce calcul s'affiche simplement sans limite.
L'API le sert dans le champ `parent_boundary` du fond (`null` pour tous les autres fonds),
`FORMAT_VERSION` 8.

**Seulement là où des EPCI débordent.** Le fond ne porte la limite que pour les départements
dont au moins un EPCI est à cheval (`straddling_count > 0` : 79 sur 101). Pour les 22 autres,
dont les DROM, elle ferait le tour des EPCI dessinés sans rien apprendre : le modèle la
calcule toujours (ses tests portent sur tous les départements), le fond ne la sert pas.

**Légende.** Quand la carte dessine le trait, la légende se termine par une ligne
« Limite du département », avec un échantillon du tireté (`components/legend/BoundaryKey.tsx`,
libellé dans `parentBoundaryKey`).
 La carte le dessine tel quel, avec un seul aspect pour Highcharts et
MapLibre (`domain/parentBoundary.ts`) ; elle n'appelle rien de plus et ne calcule rien.

**Région à la maille EPCI** (26 EPCI à cheval sur deux régions) : même mécanisme, non activé.
Il suffit d'ajouter la région à `commune_column_by_parent_type` dans le modèle et dans le
test `national_map_parent_boundary_area_close_to_origin`, et `REGION` aux valeurs acceptées
du `.yml` et au filtre de `national_map_parent_boundary_has_all_parents` ; le fond, l'API et
la carte suivent sans changement.

Tests de données (`dbt build` les lance avec les modèles) :

| Test | Ce qu'il détecte |
| --- | --- |
| `national_map_parent_boundary_has_all_parents` | Un département qui a des EPCI mais pas de limite |
| `national_map_parent_boundary_follows_children` | Un tronçon de limite qui ne suit aucune limite d'EPCI du fond hors d'un EPCI à cheval (plus d'un mètre) : il dessinerait un second trait à côté d'une limite d'EPCI |
| `national_map_parent_boundary_splits_straddling_children` | Un EPCI à cheval que la limite ne traverse pas (coupe non raccordée à son contour) |
| `national_map_parent_boundary_area_close_to_origin` | Une surface enclose à plus de 5 % de celle des communes du département (face rattachée au mauvais côté) ; 2,3 % au plus mesurés |
| `national_map_geojson_has_parent_boundaries` | Une limite calculée que son fond ne porte pas, ou un fond qui en porte une sans calcul |

Les quatre premiers ont été exécutés en lecture seule sur la requête compilée du modèle,
pour les 101 départements, avant toute construction : aucune ligne en échec.

## Ce qui reste hors de portée

- **Données carroyées 1 km × 1 km à l'échelle de la France entière et de l'Hexagone** :
  tant que le fichier `carroyage_national.pmtiles` n'est pas produit (voir ci-dessous).
- **Communes de toute la France** : 84 Mo en GeoJSON, d'où des tuiles vectorielles ; hors de
  portée tant que le fichier `communes_national.pmtiles` n'est pas produit (voir « Communes
  de toute la France » plus bas).
- **Nouveaux ménages et emplois par hectare consommé** (issue #1621) : calculable par
  Django à partir de `public_data_dc_menages` et des tables d'emploi, sans dbt, mais la
  définition est à arrêter (emplois au lieu de travail ou actifs occupés ; recensements
  2011, 2016 et 2022 seulement, donc pas de valeur propre à chaque période).

## Données carroyées (indicateur `conso_ha_gridded`)

Rendu MapLibre (`GriddedMap.tsx`) à la place de la carte Highcharts, en géographie réelle.
Le carroyage du Cerema ne couvre que l'Hexagone et la Corse.

| Zone affichée | Tuiles | État |
| --- | --- | --- |
| Région, département, EPCI | `carroyage_lea.pmtiles`, le fichier des diagnostics (DAG `ingest_carroyage_lea`), filtré sur le territoire | Fonctionne sans nouveau calcul : 2,7 Mo transférés pour la Bretagne |
| France entière, Hexagone | `carroyage_national.pmtiles` : consommation totale par année seulement, zooms 3 à 8 | À produire avec le DAG `create_carroyage_national_vector_tiles` (modèle `for_vector_tiles_carroyage_national`) ; en son absence, la carte affiche un message et invite à choisir un territoire |
| France entière, Hexagone, une destination | `carroyage_national_<destination>.pmtiles`, un fichier par destination | Écrit le 12 novembre 2026, à produire avec le même DAG : voir « Carroyage national par destination » ci-dessous |

Le fichier des diagnostics ne convient pas à la France entière : chaque carreau y porte
98 attributs à tous les zooms, et les tuiles couvrant la métropole pèsent environ 125 Mo
décompressées aux zooms 5 à 7.

Les classes de couleurs ont des bornes fixes (0,1 ; 0,5 ; 1 ; 5 ha par carreau) : la table
`public_data_landcarroyagebounds` n'a ni la France entière ni les périodes d'une seule année.

Chaque carte du carroyage est dessinée dans la couleur de sa destination sur la page
« Consommation » des diagnostics (`CARROYAGE_DESTINATION_CONFIG`, `project/charts/constants.py`),
qui est aussi celle des graphiques par destination ; la carte de toutes les destinations prend,
comme sur cette page, la couleur de l'habitat. Les cinq classes sont des nuances de cette
couleur, éclaircie vers le blanc ou assombrie vers le noir jusqu'à une clarté commune à toutes
les destinations (90, 78, 66, 54 et 42 sur l'échelle d'OKLab) : avec le dégradé continu de la
page Consommation, les trois premières classes des couleurs pâles (routes, mixte, activité,
inconnue) ne se distinguaient ni entre elles ni du fond. Les couleurs sont recopiées côté
navigateur (`domain/grid/consoColors.ts`) ; un test Jest les compare à la configuration du
serveur.

### Carroyage national par destination

Précalcul écrit le 12 novembre 2026, à construire : ni les six tables ni les six fichiers
n'existent encore. Il sert à explorer, sur la France entière et l'Hexagone, la consommation
de chaque destination. Pour une région ou un territoire plus fin, rien à produire : le
fichier des diagnostics porte déjà les attributs `conso_AAAA_<destination>`.

**Ce que lit la carte.** Un fichier par destination, pour ne charger que celle qui est
affichée, dans le même dossier que le fichier total. La couche porte le nom du fichier sans
son extension, comme pour les autres fichiers de tuiles.

| Destination | Fichier | Couche |
| --- | --- | --- |
| Toutes (existant, inchangé) | `vector_tiles/carroyage_national.pmtiles` | `carroyage_national` |
| Habitat | `vector_tiles/carroyage_national_habitat.pmtiles` | `carroyage_national_habitat` |
| Activité | `vector_tiles/carroyage_national_activite.pmtiles` | `carroyage_national_activite` |
| Mixte | `vector_tiles/carroyage_national_mixte.pmtiles` | `carroyage_national_mixte` |
| Route | `vector_tiles/carroyage_national_route.pmtiles` | `carroyage_national_route` |
| Ferroviaire | `vector_tiles/carroyage_national_ferroviaire.pmtiles` | `carroyage_national_ferroviaire` |
| Inconnu | `vector_tiles/carroyage_national_inconnu.pmtiles` | `carroyage_national_inconnu` |

Les sept fichiers ont exactement les mêmes attributs et les mêmes conventions :

- `conso_2011` à `conso_2024` : densité de consommation de l'année, en m² par km², entière.
  Le nom ne porte pas la destination : c'est le fichier qui la désigne. Une année sans
  consommation n'est pas écrite (à lire comme zéro) ; un attribut qu'aucune entité d'une
  tuile ne porte en est donc absent ;
- `resolution_km` : côté de la maille, 5 aux zooms 3 à 5, 2 au zoom 6, 1 aux zooms 7 et 8 ;
- `REGION` : liste sérialisée des codes de région (`["53"]`), identique à celle du même
  bloc dans le fichier total : le filtre de l'Hexagone ne change pas ;
- pas d'identifiant (`idcarreau` est retiré des tuiles).

Les classes et la légende du carroyage total valent donc telles quelles. Un fichier par
destination ne contient que les carreaux et les blocs où cette destination est consommée au
moins une année : toujours des mailles du fichier total, au même endroit.

**Calcul.** La requête du modèle total est devenue la macro `carroyage_national_blocs`,
appelée sans argument par `for_vector_tiles_carroyage_national` et avec sa destination par
chacun des six modèles `for_vector_tiles_carroyage_national_<destination>` (schéma
`public_for_vector_tiles`). Seule la colonne lue dans `for_vector_tiles_carroyage_lea`
change (macro `carroyage_national_origin_conso`) ; les destinations sont listées une fois,
dans la macro `carroyage_national_destinations`. Le SQL compilé du modèle total est le même
qu'avant, aux blancs près (comparaison des deux compilations) : son contenu ne change pas.

Deux particularités de la source (Cerema), mesurées le 12 novembre 2026 sur ses
255 233 carreaux et 14 années :

- la destination « inconnu » porte 36 valeurs négatives, de -1 ou -2 m². Les modèles par
  destination les ramènent à zéro. La consommation totale n'en a aucune ;
- le total d'un carreau n'est pas toujours la somme de ses destinations : sur 800 473 couples
  carreau × année consommés, 29 799 s'en écartent, dont 2 507 de plus de 3 m², de -32 à
  +37 m². La carte d'une destination et la carte totale ne se recoupent donc qu'à quelques
  dizaines de m² près par carreau, très en dessous de la première classe (0,1 ha).

**Production.** Le DAG `create_carroyage_national_vector_tiles` construit les sept modèles
ensemble (pas leurs parents), puis, pour chacun, exporte `vector_tiles/<nom>.geojson`, écrit
`vector_tiles/<nom>.pmtiles` avec les mêmes options de tippecanoe et le rend public. Les
tâches du total gardent leur nom ; celles d'une destination sont dans un groupe à son nom
(`habitat.geojson_to_pmtiles`). Deux tâches au plus tournent à la fois.

Les sept modèles se construisent ensemble : deux tests comparent les destinations au total,
et dbt les lance dès que l'un des modèles est construit. `dbt build` sur le seul modèle
total échoue tant que les six tables par destination n'existent pas.

Tests de données ajoutés (`dbt build` les lance avec les modèles) :

| Test | Ce qu'il détecte |
| --- | --- |
| `carroyage_national_destinations_match_1km_cells` | Pour chaque destination, un carreau ou un bloc absent, en trop, ou dont la consommation d'une année s'écarte de celle des carreaux de 1 km de la source de plus que l'arrondi (un modèle qui lirait la colonne d'une autre destination, par exemple) |
| `carroyage_national_destinations_sum_to_total` | Un carreau ou un bloc du total dont la densité d'une année s'écarte de la somme des six destinations de plus de 100 m² par km², à toutes les résolutions. La tolérance couvre les écarts de la source ; une égalité à l'arrondi près (3 m²) échouerait sur 2 507 couples carreau × année |
| `carroyage_national_destinations_densities_are_positive` | Une densité nulle ou négative dans un fichier par destination |
| `carroyage_national_destinations_blocks_are_in_total` | Un carreau ou un bloc d'une destination absent du total, ou qui en diffère par la résolution, les régions ou le tracé |
| Tests du fichier `.yml` | Identifiant nul ou en double, résolution inattendue, géométrie nulle ou hors EPSG:4326, pour chacun des six modèles |

Ces tests et ceux du total, appliqués en lecture seule au SQL compilé, ne relèvent aucune
ligne : sur la France entière sans les tracés, et sur la Bretagne avec les tracés. Huit
anomalies introduites à dessein (colonne d'une autre destination, destination vide, densité
doublée, bloc hors du total, régions ou tracé différents, zéro au lieu de NULL, valeurs
négatives laissées) sont chacune relevées par le test prévu.

**Volumes et poids.** Nombre de carreaux et de blocs mesuré sur la France entière (SQL
compilé, sans les tracés). Poids estimés à partir d'un prototype local sur la Bretagne
(export puis tippecanoe 2.75.1 avec les options du DAG), rapporté aux volumes nationaux et
calé sur le fichier total réel (15,5 Mo, 0,8 Mo transférés pour la France entière ; la
méthode lui prédit 16,1 Mo et 0,87 à 0,93 Mo avant calage) :

| Fichier | Carreaux de 1 km | Blocs de 2 km | Blocs de 5 km | Poids estimé | Premier affichage France entière, estimé |
| --- | --- | --- | --- | --- | --- |
| Total (réel) | 255 233 | 107 095 | 21 775 | 15,5 Mo | 0,8 Mo |
| Habitat | 229 912 | 101 520 | 21 551 | 13,6 Mo | 0,75 Mo |
| Activité | 54 884 | 37 431 | 16 152 | 3,5 Mo | 0,31 Mo |
| Mixte | 16 217 | 13 895 | 8 866 | 0,9 Mo | 0,10 Mo |
| Route | 75 514 | 46 385 | 16 561 | 4,1 Mo | 0,31 Mo |
| Ferroviaire | 1 017 | 771 | 562 | 0,14 Mo | 0,02 Mo |
| Inconnu | 26 102 | 22 054 | 12 932 | 1,4 Mo | 0,14 Mo |

Soit environ 24 Mo pour les six fichiers. À vérifier sur les premiers fichiers produits,
avec `tippecanoe-decode --stats`. Quelques blocs gardent toutes leurs densités à NULL après
arrondi (1 319 blocs de 2 km et 547 de 5 km pour « inconnu », moins de 300 ailleurs, aucun
dans le total) : ils sont écrits mais jamais dessinés, la carte ne retenant que les
consommations positives.

## Communes de toute la France (tuiles `communes_national.pmtiles`)

Précalcul écrit le 12 novembre 2026, à construire : rien n'est encore dans l'entrepôt ni
sur S3. Il est destiné à la maille commune sur la France entière et l'Hexagone, où les
communes seront dessinées par MapLibre et colorées par leur identifiant.

| Élément | Contenu |
| --- | --- |
| Modèle `national_map_drom_placement` (schéma `public_land`) | Une ligne par région d'outre-mer : facteur d'échelle, translation, cartouche, emplacement, emprise de référence de l'Hexagone et de la Corse, ligne de séparation, en EPSG:3857. Calculé sur les régions de `land_national_map_geom` par la macro `national_map_drom_placement`. |
| Modèle `for_vector_tiles_communes_national` (schéma `public_for_vector_tiles`) | Une ligne par commune de `land` : `land_id`, `name`, `REGION`, `DEPART` et `simple_geom` en EPSG:4326. Les communes d'outre-mer sont déplacées près de l'Hexagone par la macro `national_map_apply_drom_placement` ; l'Hexagone et la Corse gardent leur position réelle. |
| DAG `create_communes_national_vector_tiles` | Construit ces deux modèles (pas leurs parents), exporte `vector_tiles/communes_national.geojson`, puis écrit et rend public `vector_tiles/communes_national.pmtiles` : couche `communes_national`, zooms 3 à 10. Sans planification : il ne tourne que sur déclenchement. |

Le DAG est à relancer après chaque rafraîchissement de `land` : la carte joint ses valeurs
aux tuiles par le code INSEE, une commune créée ou supprimée depuis la dernière génération
resterait grise ou absente.

Le placement des DROM existe en deux écritures, toutes deux fondées sur la maille région :
en SQL pour les tuiles, en Python (`public_data/domain/national_map.py`) pour les fonds
GeoJSON. Sur les emprises exactes des 18 régions, les deux donnent le même résultat à la
précision des nombres flottants (mesuré). Par rapport au fond par région servi en local,
dont les coordonnées sont arrondies au mètre, les cartouches s'écartent de 0,66 m au plus
et la ligne de séparation de 0,29 m (mesuré). Un jeu d'essai commun, des rectangles pour
l'Hexagone, la Corse et les cinq DROM, garde l'accord : ses valeurs attendues sont écrites
en clair dans le test `national_map_placement_matches_python_on_synthetic_regions` et
doivent l'être aussi dans les tests Python du placement.

Cet accord suppose que Django serve le fond allégé (`public_data_national_map_geojson`),
construit sur les mêmes régions. Avec le repli sur `public_data_land_geojson`, dont les
régions ont une autre emprise, les cartouches calculés par Django s'écartent de ceux des
tuiles de 0,8 à 4,1 km selon le DROM (mesuré en local) : la table allégée doit être copiée
dans toute application qui lit ces tuiles.

Options de tippecanoe : chaque commune reste une entité à part entière à tous les zooms,
sans regroupement ni suppression (`--no-feature-limit`, `--no-tile-size-limit`,
`--no-tiny-polygon-reduction`, `--no-simplification-of-shared-nodes`, `--low-detail=11`).
Mesures du 12 novembre sur un prototype local de 1 266 communes (Puy-de-Dôme, Somme,
Guadeloupe ; 53 points par commune, contre 57 pour le pays), tippecanoe 2.75.1 :

| Zoom | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Communes absentes | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Octets compressés par commune et par tuile | 24,1 | 28,1 | 34,9 | 46,1 | 64,3 | 88,6 | 97,5 | 116,3 |

La commune absente au zoom 3 fait moins d'un km² : elle y est plus petite qu'une maille de
la grille de la tuile. Parmi les 40 plus petites communes de France (3 à 83 ha), ajoutées
à l'essai, 6 manquent au zoom 3 et aucune à partir du zoom 4. Poids estimés pour le pays,
par extrapolation : 0,85 Mo au zoom 3, 0,99 Mo au zoom 4, 1,24 Mo au zoom 5, environ 20 Mo
pour le fichier. À vérifier sur le premier fichier produit, avec
`tippecanoe-decode --stats`.

Tests de données (`dbt build` les lance avec les modèles) :

| Test | Ce qu'il détecte |
| --- | --- |
| `national_map_placement_matches_python_on_synthetic_regions` | Un placement SQL qui s'écarte des valeurs attendues du jeu d'essai commun avec Python |
| `national_map_placement_has_all_drom` | Une région d'outre-mer sans placement |
| `national_map_placement_insets_fit_disjoint_slots` | Un cartouche qui déborde de son emplacement, deux emplacements superposés |
| `national_map_placement_insets_avoid_hexagone` | Un cartouche qui recoupe la géométrie d'une région de l'Hexagone ou de la Corse |
| `national_map_placement_scale_is_cosine_ratio` | Un facteur d'échelle différent du rapport des cosinus de latitude, ou hors de 1,35 à 1,45 |
| `national_map_placement_moves_regions_into_insets` | Une translation incohérente avec le cartouche |
| `national_map_communes_match_land` | Une commune de `land` absente des tuiles, ou une entité en trop |
| `national_map_communes_follow_placement` | Une commune mal placée ou mal dimensionnée : emprise et surface inchangées dans l'Hexagone et en Corse, déplacées selon le placement de la région outre-mer |
| `national_map_communes_drom_fit_their_slot` | Une commune d'outre-mer hors de l'emplacement de sa région |
| `national_map_communes_drom_avoid_hexagone` | Une commune d'outre-mer dessinée sur une région de l'Hexagone ou de la Corse |
| Tests des fichiers `.yml` | Identifiant nul ou en double, région ou département inconnu, géométrie nulle, vide, invalide, non surfacique ou hors EPSG:4326 |

## Sols artificialisés (tuiles `sols_artificialises_national.pmtiles`)

### Ce que la carte affiche : l'image de l'IGN d'abord, nos mailles en secours

Depuis le 13 novembre 2026, la carte « Sols artificialisés » montre l'image de l'OCS GE publiée par
l'IGN sur la Géoplateforme, dessinée objet par objet, et non plus nos mailles : celles-ci étaient
trop grossières pour une donnée aussi précise.

| Ce qui est dessiné | Source | Quand |
| --- | --- | --- |
| Image des sols, artificialisés ou non | Flux WMTS `https://data.geopf.fr/wmts`, couche `OCSGE.ARTIF.<génération>`, niveaux 6 à 16, tuiles PNG de 256 px | Dès que la carte est au zoom 3,5 ou plus (la France entière sur un téléphone), jusqu'aux objets |
| Cartouches d'outre-mer de la France entière | Flux WMS `https://data.geopf.fr/wms-r`, même couche : une image de 512 px de large par territoire, pour son emprise réelle (`source_bbox` de l'API du fond), posée sur son cartouche | France entière |
| Objets OCS GE, avec leur nature au survol | Tuiles des diagnostics, `occupation_du_sol_<millésime>_<département>.pmtiles` | À partir du zoom 13 |
| Mailles de 5 km à 250 m (`sols_artificialises_national.pmtiles`) | Notre précalcul, décrit plus bas | Seulement en secours : sous le zoom 3,5, et quand les tuiles de l'IGN ne répondent pas (autre réponse que 404) |

Règles :

- **Génération de l'IGN.** L'IGN publie une couche par génération de millésimes (`2017-2020`,
  `2021-2023`, `2024-2026`). La carte montre celle du dernier millésime de la plus grande part
  de la surface affichée (`artif_years` de l'API `artif-indicators`) : le Rhône, dont le dernier
  millésime est 2020, est montré dans la génération `2017-2020`. L'image peut rester plus récente
  que les chiffres pour une partie d'une région ou du pays ; la méthode de la légende le dit.
- **Rognage sur les territoires dessinés** (depuis le 16 novembre 2026). Hors de la France
  entière, l'image n'est visible que sur les territoires dessinés ; autour, le fond blanc de la
  carte. MapLibre ne sait pas découper une image en tuiles : un masque de la couleur du fond est
  posé juste au-dessus d'elle, sous les mailles, les objets et les limites. Il est percé au
  contour de la réunion des territoires, calculé dans le navigateur sans appel au serveur
  (`domain/grid/imageClip.ts`) : les territoires d'un même fond partagent exactement leurs
  sommets, une arête parcourue par deux voisins est donc intérieure, et celles qui restent
  forment le contour.
  - Le masque suit les territoires dessinés, non la zone : à la maille EPCI d'une région ou d'un
    département, les EPCI à cheval sont dessinés en entier, image comprise, comme leurs objets aux
    grands zooms. Les îles font chacune un trou ; une enclave d'un autre territoire (l'Enclave des
    Papes dans la Drôme, Llívia dans les Pyrénées-Orientales) est masquée.
  - Une enclave de moins de 2 km² projetés (environ 1 km² sur le terrain) n'est pas masquée : c'est
    un défaut du fond simplifié, pas un territoire voisin. Un anneau situé à l'intérieur de la
    réunion (deux communes qui se recouvrent) est ignoré.
  - Hexagone : l'image est rognée de la même façon, la Corse n'y est donc plus dessinée. France
    entière : pas de masque, l'OCS GE ne couvrant que la France et les cartouches recevant leur
    propre image.
  - Mesures sur les fonds réels (16 novembre 2026, 256 fonds : chaque région par département, EPCI
    et commune, chaque département par EPCI et commune, plus l'Hexagone par EPCI) : 27 ms au plus
    pour calculer un masque (3 ms pour les 172 EPCI d'Auvergne-Rhône-Alpes, 20 ms pour les
    4 293 communes de Nouvelle-Aquitaine, 19 ms pour les 1 213 EPCI de l'Hexagone), 48 trous et
    2 863 sommets au plus, 38 Ko au plus une fois en GeoJSON. Aucun anneau n'en croise un autre.
  - Écarté : le contour de l'API `/api/landsgeom/<type>/<id>` (12 Ko et 0,11 s pour
    Auvergne-Rhône-Alpes, 337 Ko et 0,45 s pour la Bretagne). C'est un appel de plus, sa
    simplification n'est pas celle des fonds de la carte (pour Auvergne-Rhône-Alpes, 132 de ses
    323 sommets sont à plus de 100 m des limites du fond par département, jusqu'à 2 km : le bord
    du masque ne suivrait pas le trait des limites), et il suit la zone, pas les EPCI qui en
    débordent.
  - La source des tuiles n'est recréée que si leur adresse (la génération) ou leur emprise change :
    d'une zone à l'autre d'une même génération, les tuiles déjà chargées restent dessinées sous le
    nouveau masque le temps que les suivantes arrivent. Quand la génération change (d'Auvergne-
    Rhône-Alpes au Rhône, par exemple), les territoires restent blancs le temps du chargement.
  - Aucune tuile n'est demandée hors de la métropole (ou des abords d'un territoire d'outre-mer).
- **Cartouches.** Zoomer sur un cartouche ouvre le territoire à sa position réelle : l'image
  n'existe que là.
- **Mailles d'ouverture.** L'image recouvre les territoires, qui ne servent qu'à se repérer et à
  ouvrir une zone : la carte s'ouvre par région sur le pays, et une région s'ouvre par EPCI
  (`openingScales` du catalogue, `artifIndicators.ts`). L'utilisateur peut toujours choisir une
  autre maille ; elle vaut jusqu'au prochain changement de zone ou de carte.
- **Image exportée.** Le bouton « Exporter la carte » compose l'image dans le navigateur
  (`components/stage/exportPng.ts`) : titre, sous-titre, carte, légende de ce qui est dessiné
  (mailles, image de l'IGN ou objets) et crédits. La carte de toutes les communes du pays
  s'exporte de la même façon, avec ses classes ou la grille de sa carte bivariée.
- **Couleurs.** Celles de l'IGN sont à moitié transparentes : la carte dessine l'image deux fois
  et la sature un peu (réglage dans `domain/grid/soilImage.ts`, couleurs obtenues mesurées sur
  captures : `#ff9b93` et `#b4ff8d`).
- **Objets aux couleurs de l'image.** À partir du zoom 13, les objets vectoriels prennent les deux
  couleurs de l'image (`SOIL_OBJECT_CLASSES` est la légende de l'image) : en zoomant, rien ne
  change à l'œil, seulement ce qu'on peut faire. La carte le dit donc tant qu'elle dessine les
  objets : une pastille « Objets interactifs » en bas de la carte, et la ligne de la légende
  « survolez ou touchez un objet pour lire sa nature ».
- **Stockage de développement.** Les tuiles d'objets (`occupation_du_sol_<millésime>_<département>.pmtiles`)
  sont produites par département : un stockage de développement n'en contient que quelques-unes.
  Là où un fichier manque, la carte garde l'image et le dit (« Les objets OCS GE ne sont pas
  disponibles partout dans cette vue »). Ce message ne signale pas une donnée absente : en
  staging et en production, les fichiers de tous les départements couverts existent.
- **Poids.** Mesuré à 1440 × 900 px : 9 tuiles et 0,37 Mo pour la France entière, 9 tuiles et
  1,04 Mo pour le Rhône, contre 0,19 Mo et 0,39 Mo avec les mailles.
- **Dépendance.** La carte dépend de la disponibilité de la Géoplateforme ; `config/csp.py`
  autorise déjà `https://data.geopf.fr`, utilisé par les orthophotos des diagnostics.

### Précalcul des mailles

Précalcul écrit et construit le 13 novembre 2026 sur l'entrepôt de développement (mesures plus
bas) ; à construire sur les autres environnements. Depuis que la carte montre l'image de l'IGN,
il ne sert plus qu'en secours, et pour dire aux objets OCS GE quels départements sont en vue.

Les tuiles OCS GE des diagnostics ne conviennent pas : 12,5 Go pour les 101 départements, et
pour un seul département 12 à 15 Mo par tuile aux zooms 4 à 9, 3,3 Mo au zoom 11 (mesuré sur
l'Ille-et-Vilaine). À ces échelles un objet OCS GE fait moins d'un pixel : la carte lit donc
la **part artificialisée de mailles carrées**, valeur relative qui se dessine en aplat.

| Élément | Contenu |
| --- | --- |
| Modèle `artif_carroyage_commune` (schéma `public_ocsge`) | Surface artificialisée et surface couverte par l'OCS GE, par commune et par maille de 250 m, au dernier millésime de chaque département. Grille de la projection d'origine du territoire. Un objet contenu dans une maille y verse sa surface ; seuls les objets à cheval sont découpés, par une intersection exacte (`ST_Intersection`). `ST_ClipByBox2D`, plus rapide, est écartée : elle ajoute ou retire une maille entière sur certains polygones troués (environ 120 mailles fausses sur le pays, relevées par les tests du modèle). |
| Modèle `for_vector_tiles_sols_artificialises_national` (schéma `public_for_vector_tiles`) | Les mêmes mailles regroupées en blocs de 500 m, 1 km, 2 km et 5 km, toutes résolutions empilées : `part_artif` (entier, %), `resolution_m`, `annee_min`, `annee_max`, `placement`, listes `REGION`, `DEPART`, `EPCI` (cette dernière jusqu'à 1 km). Les mailles d'outre-mer y figurent deux fois : position réelle (`placement` = `reel`) et cartouche près de l'Hexagone (`cartouche`), selon `national_map_drom_placement`. |
| DAG `create_sols_artificialises_national_vector_tiles` | Construit ces deux modèles (pas leurs parents), exporte `vector_tiles/sols_artificialises_national.geojson`, puis écrit et rend public `vector_tiles/sols_artificialises_national.pmtiles` : couche `sols_artificialises_national`, zooms 3 à 10. Sans planification. |

Résolution servie à chaque zoom (une seule par zoom, filtre de tippecanoe) : 5 km aux zooms 3
à 5, 2 km aux zooms 6 et 7, 1 km au zoom 8, 500 m au zoom 9, 250 m au zoom 10. Toutes les
mailles du territoire existent, y compris les non artificialisées : à partir du zoom 7 une
maille fait au moins 4,8 px, pour qu'une vue de 1440 × 900 px ne charge pas plus de
137 000 mailles.

La part rapporte l'artificialisé à la surface couverte par l'OCS GE dans la maille, pas à la
maille entière : une maille côtière n'est pas diluée. Sans OCS GE, pas de maille (22 communes
de Guyane). Le découpage des résolutions par zoom est partagé avec le carroyage de la
consommation : `get_zoom_bounds` et `get_resolution_by_zoom_filter` sont dans
`airflow/include/vector_tiles.py`.

Le DAG est à relancer après chaque livraison d'un millésime OCS GE.

Mesures du 13 novembre 2026, en lecture seule sur des échantillons :

| Mesure | Résultat |
| --- | --- |
| Découpage exact à 1 km, carré de 40 km autour de Rennes (178 701 objets) | 7,0 s ; surfaces conservées à 0,01 km² près sur 1 681 km² |
| Même découpage à 250 m | 44,9 s |
| Ille-et-Vilaine entière à 1 km (546 314 objets), mailles et blocs | 22,6 s, 7 215 mailles |
| Octets compressés par maille et par tuile (tippecanoe 2.75.1, options du DAG) | 6,3 à 9,3 selon le zoom |

Mesures sur le pays (construction du 13 novembre 2026, entrepôt de développement) :

| Étape | Résultat |
| --- | --- |
| Modèle `artif_carroyage_commune` | 10 983 222 lignes en 1 h 44, sur dix processus (4 h 27 sur un seul avec `ST_ClipByBox2D`, résultat faux sur environ 120 mailles) |
| Modèle `for_vector_tiles_sols_artificialises_national` | 12 926 219 lignes en 3 min |
| Export GeoJSON | 22 min |
| tippecanoe | 32 min, fichier de 92 Mio |
| France entière à l'écran (1440 × 900 px) | 24 452 mailles de 5 km, 0,19 Mo transféré en 3 requêtes |
| Rhône à l'écran | 3 912 mailles de 1 km, 0,39 Mo transféré |
| Lyon au zoom 14 (objets OCS GE) | 2 390 objets affichés en 2,2 s, 0,46 Mo transféré |

Tests de données (`dbt build` les lance avec les modèles) :

| Test | Ce qu'il détecte |
| --- | --- |
| `artif_carroyage_commune_matches_ocsge_stock` | Une commune dont la somme des mailles s'écarte de plus de 0,1 % de `artif_commune` (surface artificialisée) ou de `commune_couverture_et_usage` (surface couverte) ; une commune de l'OCS GE sans maille |
| `artif_carroyage_commune_cells_fit_their_size` | Une maille plus remplie que sa surface, ou plus artificialisée que couverte (objet compté deux fois ou non découpé) |
| `sols_artificialises_national_blocks_match_cells` | Un bloc absent, en trop, ou dont la part ou les années diffèrent du recalcul fait sur les mailles fines, à chaque résolution |
| `sols_artificialises_national_cartouches_follow_placement` | Une maille d'outre-mer sans copie déplacée, une copie différente de son origine ou mal placée, un placement porté par une maille de l'Hexagone |
| Tests des fichiers `.yml` | Identifiant nul ou en double, résolution inattendue, part hors de 0 à 100, géométrie nulle ou hors EPSG:4326 |

Exécutés sur le SQL compilé pour 8 communes autour de Rennes et 4 communes de Guadeloupe, ces
quatre tests ne relèvent aucune ligne ; cinq anomalies introduites à dessein sont chacune
relevées par le test prévu.

## Anneaux d'artificialisation et de désartificialisation

Aucun calcul nouveau : l'appel `artif-indicators` sert déjà, à toutes les mailles, les flux
bruts `artif_gross_ha` et `desartif_gross_ha` entre les deux derniers millésimes de chaque
territoire (56,6 Ko compressés pour les 1 255 EPCI). La carte en fait un anneau par
territoire, dont la surface est proportionnelle au flux brut.

## Communes de toute la France : appels de l'API

**Fond et cadre.** La carte nationale par commune reprend le fond des départements
(`base-map?scale=DEPART`) ; `base-map?scale=COMM` reste refusé sans territoire parent. Les
fonds nationaux des mailles département et EPCI appliquent le placement des DROM calculé
sur le fond par région (`reference_placement`), au lieu de le recalculer sur leurs propres
entités : cartouches et ligne de séparation sont identiques aux trois mailles, et le cadre
total ne diffère plus que de 452 m à l'est (généralisation des départements). Auparavant la
maille EPCI, où manquent Ouessant et Sein, décalait les cartouches de 34 à 42 km (mesuré).
Une entité plus étendue que sa région généralisée déborde du cartouche : 6,5 km au sud de
la Guadeloupe par département.

**Valeurs.** `GET /public/national-map/values?scale=COMM&key=<clé>&amount=<clé>&start_year=&end_year=`
sert une colonne par commune, calculée à la volée (`public_data/domain/national_map_values.py`) :

```
{"scale", "key", "amount", "start_year", "end_year",
 "ids": [...], "regions": [...], "values": [...], "amounts": [...],
 "no_data": [[identifiant, nom], ...], "no_data_count"}
```

- `ids` : codes INSEE triés ; `regions`, `values` et `amounts` sont alignés dessus.
  `amounts` n'existe que si `amount` est demandé : c'est la valeur en hectares dont `key` est la
  version relative (`conso_ha` pour `conso_pct_surface`, `artif_ha` pour `artif_pct`), et elle seule.
- Clés (liste fermée, 400 sinon) : les valeurs par territoire des appels `indicators` et
  `artif-indicators`, avec exactement les mêmes valeurs, et la version relative de chaque
  consommation en hectares, rapportée à la surface de la commune (suffixe `_pct_surface`, en %
  à deux décimales). Les périodes de référence n'ont pas de clé : elles se demandent, comme
  toute période, par `start_year` et `end_year`.
- Carte bivariée : `classes`, `conso_rates` et `indic_rates` à la place de `values`, et
  l'objet `bivariate` (palette, seuils, libellés) de la clé.
- Artificialisation : `year_sets` (jeux de millésimes distincts) et `year_set_index` (rang
  du jeu de chaque commune) en plus.
- La période n'est lue que pour les clés qui en dépendent ; `start_year` et `end_year`
  valent `null` pour les autres.
- Sans donnée de consommation ou sans OCS GE (`has_conso`, `has_ocsge`), la valeur est
  `null` et la commune figure dans `no_data` (50 au plus, `no_data_count` les compte toutes) :
  20 communes pour la consommation, 22 pour l'OCS GE. L'appel `indicators` donne 0 à ces
  20 communes, ce qui n'est pas une mesure.

Les sommes de consommation sont faites par la base. Pour qu'elles soient identiques au bit
près à celles d'`indicators`, les communes dont une consommation n'est pas un nombre entier
de m² sont relues et additionnées dans l'ordre des années (210 millésimes au plus).

La réponse est mise en cache déjà compressée (un jour sans période, une heure pour les
trois périodes de référence, dont la période par défaut, dix minutes sinon) et renvoyée telle
quelle. Le référentiel des communes
et les colonnes d'artificialisation sont en cache un jour.

Mesures locales du 12 novembre 2026 (34 875 communes, corps hors cache, référentiel en cache ;
médianes de deux relevés de cinq appels, sur une machine occupée par d'autres traitements) :

| Réponse | Poids compressé | Temps serveur |
| --- | --- | --- |
| Consommation, version relative seule | 104 à 168 Ko | 0,21 à 0,29 s |
| Consommation, version relative et hectares | 101 à 196 Ko | 0,20 à 0,37 s |
| Carte bivariée | 228 à 259 Ko (84 Ko pour une seule année, sans seuils) | 0,04 à 0,24 s |
| Artificialisation, version relative et hectares | 198 à 239 Ko | 0,8 à 1,2 s au premier appel, puis 0,05 à 0,08 s |
| Corps en cache | | 1 ms |
| Référentiel hors cache | | 0,33 à 0,51 s de plus |

## Mesures locales (12 novembre 2026, sans cache)

| Appel | Temps | Poids compressé |
| --- | --- | --- |
| Fond France par EPCI | 1,3 à 1,9 s | 2,4 Mo |
| Fond Nouvelle-Aquitaine par commune | 2 à 4 s | 4,6 Mo |
| Indicateurs Nouvelle-Aquitaine par commune | 3 s (40 s avant la sous-requête sur les taux bivariés) | 0,3 Mo |
| Indicateurs France par EPCI | 0,3 à 4 s | 0,1 Mo |

La table `public_data_bivariate_land_rate` pèse 2,1 Go (15,9 millions de lignes à la
maille commune, 91 périodes). La restreindre à une liste de milliers d'identifiants
fait choisir à PostgreSQL l'index `(land_id, land_type)` et lire toutes les périodes
de chaque commune ; la vue passe donc par une sous-requête sur `public_data_land`.

## Points de sémantique à garder en tête

- Dans `public_data_landconsostats`, `from_year` et `to_year` sont **inclus** :
  (2011, 2013) = millésimes 2011, 2012 et 2013. « Entre le 1er janvier 2011 et le
  1er janvier 2021 » correspond donc à (2011, 2020).
- Les surfaces de `public_data_land` sont en hectares ; celles de
  `public_data_landconso` et les consommations de `public_data_landconsostats` sont
  en m².
- L'évolution entre les périodes 2011-2020 et 2021-dernier millésime est calculée
  sur les **rythmes annuels**, les deux périodes n'ayant pas la même durée.
