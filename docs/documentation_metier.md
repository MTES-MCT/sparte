# Documentation métier

## Logique métier

### Correction des données de consommation

Les données de consommation d'espaces proviennent du Cerema (source MAJIC). Elles sont livrées par code commune, mais certains codes ne correspondent pas au Code Officiel Géographique (COG) actuel (fusions, scissions de communes). Un processus de correction aligne ces données sur le COG 2024.

**Les 4 statuts de correction :**

| Statut | Description | Exemple |
| --- | --- | --- |
| **UNCHANGED** | Données inchangées par rapport à la source. Cas par défaut pour les communes dont le code n'a pas changé. | Majorité des communes |
| **COG_ERROR** | Le code commune source ne correspond pas au COG actuel. La consommation est redistribuée au prorata de la surface. | `60054` → scindée en `60054` (42.24%) + `60694` (57.76%) |
| **DIVISION** | Les données sont divisées par un coefficient de surface basé sur les divisions du dernier COG. | Même mécanisme que COG_ERROR |
| **MISSING_FROM_SOURCE** | Communes absentes de la source MAJIC. Toutes les consommations sont mises à 0. | Mayotte (`97601`–`97617`), Suzan (`09304`), Île-de-Sein (`29083`), Île-Molène (`29084`) |

**Mécanisme de répartition** : lors d'une scission, toutes les colonnes de consommation (par année et par destination) sont multipliées par un pourcentage choisi manuellement (actuellement basé sur la surface du territoire). Lors d'une fusion, les consommations des communes fusionnées sont additionnées. Lorsque ce mécanisme est appliqué, les diagnostics de consommation ne sont pas accessibles à l'échelle de la commune concernée, mais uniquement à l'échelle supérieure (EPCI, département, etc.).

Cette méthode au prorata de la surface est imparfaite (une répartition par population ou par ménages serait plus représentative), mais elle concerne très peu de communes. Idéalement, la correction devrait être faite à la source par le Cerema.

### Trois niveaux d'objectifs de réduction

Un territoire peut avoir un objectif de réduction de la consommation d'espaces selon trois niveaux :

1. **Territorial** (depuis un document d'urbanisme) — réglementaire et territorialisé
2. **Hérité du parent** — non réglementaire, suggéré par le territoire englobant
3. **Personnalisé** (saisi par l'utilisateur) — correspond à l'objectif national par défaut (-50%), non réglementaire

L'objectif personnalisé n'est visible que par l'utilisateur qui l'a saisi.

### Territorialisation des objectifs

La **territorialisation** est le mécanisme par lequel les objectifs de réduction de consommation d'espaces sont déclinés du niveau national vers les niveaux territoriaux inférieurs, via les documents d'urbanisme (SRADDET, SCoT, PLU).

**Cascade des objectifs** : un objectif défini dans un SRADDET (région) se décline vers les SCoT, puis vers les EPCI et communes. Chaque territoire peut avoir :
- Un **objectif propre**, inscrit dans un document d'urbanisme (réglementaire)
- Un **objectif hérité** du territoire parent, lorsque le territoire ne dispose pas encore de son propre objectif (suggéré, non réglementaire)

Le modèle stocke pour chaque objectif territorialisé : le territoire concerné, le territoire parent qui donne l'objectif, le pourcentage de réduction, le nom et l'URL du document source, et un indicateur d'inscription effective dans le document.

**Calcul de la consommation autorisée** : la consommation autorisée sur la décennie 2021-2031 est calculée en appliquant le pourcentage de réduction à la consommation de référence 2011-2020. Par exemple, un objectif de -50% sur un territoire ayant consommé 100 ha sur 2011-2020 autorise 50 ha sur 2021-2031.

**Projection et suivi** : l'application projette la consommation à 2031 en se basant sur le rythme annuel observé depuis 2021, puis calcule un taux d'atteinte de l'objectif et un éventuel dépassement.

**Accès** : la fonctionnalité de territorialisation est actuellement réservée aux membres DGALN. Les autres utilisateurs voient uniquement l'objectif national (-50%).

### Quel COG est utilisé ?

Le COG (Code Officiel Géographique) utilisé par l'application est celui de l'année de production des données de consommation d'espace (source MAJIC/Cerema), qui est la donnée la plus importante du site. Par exemple, si les données de consommation sont produites au 1er janvier 2024, le COG 2024 est utilisé. Un changement de COG implique de mettre à jour les limites administratives (Admin Express), de corriger les données de consommation et de population pour les communes ayant changé de code, puis de propager ces corrections à tous les niveaux territoriaux.

### Mise à jour des millésimes de données

#### Consommation d'espace

L'ajout d'un nouveau millésime de consommation d'espace (source MAJIC/Cerema) est une opération transversale qui impacte l'ensemble de l'application. Elle nécessite :
- La vérification de la cohérence des données avec le COG de l'année de production (correction des codes communes ayant changé)
- La vérification de tous les croisements avec d'autres données (données démographiques INSEE, permis de construire SITADEL, logements vacants ZLV, logements sociaux RPLS) et l'anticipation de leur mise à jour coordonnée
- La mise à jour de nombreuses références en dur au dernier millésime disponible, présentes dans l'ETL, le backend et le frontend

#### Artificialisation (OCS GE)

L'OCS GE fonctionne actuellement avec deux millésimes par département. L'arrivée d'un troisième millésime nécessitera :
- L'adaptation du calcul du statut de couverture, qui suppose actuellement exactement 2 millésimes par département
- Un possible réajustement des index de millésime pour certains départements, afin d'aligner les années sur des périodes plus cohérentes entre départements
- Le calcul des flux (artificialisation/désartificialisation) se fera automatiquement entre chaque paire d'index consécutifs (1→2 et 2→3)

### Période de référence 2011-2020

L'objectif ZAN (Zéro Artificialisation Nette) compare la consommation 2021-2031 à la moyenne de la **décennie** 2011-2020.

**Pourquoi 2011-2020 et pas 2011-2021 ?** Parce que 2011-2020 représente exactement 10 ans, alors que 2011-2021 en ferait 11. La loi Climat et Résilience impose une réduction de 50 % par rapport à la consommation de la **décennie** précédente, sans préciser les bornes exactes. Ce flou est source de nombreuses erreurs d'interprétation : beaucoup d'acteurs (collectivités, bureaux d'études) se trompent sur cette période de référence. Une mauvaise période fausse le calcul de l'objectif de réduction et peut induire les territoires en erreur.

### Décalage temporel des croisements INSEE

Les recensements INSEE (2011, 2016, 2022) ne correspondent pas exactement à la période de référence 2011-2020 utilisée pour les objectifs ZAN.

**Questions ouvertes :**
- Comment est géré l'alignement temporel ?
- Pourquoi ne pas interpoler les données démographiques annuellement ?

### Secrétisation des logements vacants

Les données de logements vacants proviennent de **Zéro Logement Vacant** et sont déjà secrétisées à la source (secret statistique). L'application affiche les données telles quelles et signale les territoires concernés par la secrétisation.

### Statut des friches (gisement)

Les friches sont classées selon 4 niveaux de "gisement", calculés à partir des surfaces par statut de friche (sans projet, avec projet, reconvertie) :

| Gisement | Condition |
| --- | --- |
| **Gisement nul et sans potentiel** | Aucune surface de friche (sans projet = 0, avec projet = 0, reconvertie = 0) |
| **Gisement nul car potentiel déjà exploité** | Pas de friche sans projet, mais des friches avec projet et/ou reconverties |
| **Gisement potentiel et non exploité** | Des friches sans projet, mais aucune avec projet ni reconvertie |
| **Gisement potentiel et en cours d'exploitation** | Des friches sans projet ET des friches avec projet et/ou reconverties |

La logique repose sur trois axes :
- S'il y a des friches sans projet → le gisement est **potentiel**, sinon il est **nul**
- La présence de friches reconverties détermine si le potentiel a été **exploité**
- La présence de friches avec projet détermine si l'exploitation est **en cours**

### Territoires interdépartementaux et OCS GE

L'OCS GE (Occupation du Sol à Grande Échelle) est produite par l'IGN **département par département**, avec des millésimes (années de référence) qui varient selon les départements. Certains territoires (EPCI, SCoT, régions) s'étendent sur plusieurs départements, ce qui crée des enjeux de couverture et d'agrégation.

#### Identification des territoires interdépartementaux

Chaque territoire possède une liste de départements et un indicateur d'interdépartementalité, activé dès que le territoire couvre plus d'un département.

#### Agrégation de l'OCS GE

Les données OCS GE (artificialisation, imperméabilisation) sont d'abord calculées à la **commune**, puis agrégées vers les niveaux supérieurs (EPCI, SCoT, région, nation). Le département d'origine des données est préservé tout au long de la chaîne pour assurer la traçabilité.

#### Couverture partielle

Quand un territoire interdépartemental n'a pas l'OCS GE sur tous ses départements, un statut de couverture est calculé :

| Statut | Condition |
| --- | --- |
| **COMPLETE_UNIFORM** | 1 département, 2 millésimes disponibles |
| **COMPLETE_NOT_UNIFORM** | N départements, 2×N millésimes disponibles (toutes les données sont là, mais les années peuvent différer) |
| **PARTIAL** | N départements, mais moins de 2×N millésimes (données incomplètes) |
| **PARTIAL_DUE_TO_PRODUCTOR_ISSUE** | Cas spécial Guyane — données incomplètes à cause du producteur |
| **NO_DATA** | Aucun millésime disponible |

#### Système d'index de millésime

Chaque département a ses propres années OCS GE (ex : département A a 2018 et 2021, département B a 2019 et 2023). Pour pouvoir comparer et agréger les données entre départements, un **index séquentiel** est attribué par département : l'index 1 correspond au premier millésime disponible, l'index 2 au second.

Cela permet de calculer des flux (artificialisation / désartificialisation) entre "index 1 → index 2" de manière homogène, même si les années réelles diffèrent d'un département à l'autre. Sans cet index, il serait impossible d'additionner les flux d'un EPCI interdépartemental dont les communes ont des millésimes différents.

Avec l'arrivée du **troisième millésime**, certains départements verront un ajustement d'index pour aligner les années sur des périodes plus cohérentes avec le reste du territoire. Par exemple, le Gers avec les années 2016 et 2019 : le millésime 2016 passerait en index 0 (non affiché), et les index 1 et 2 correspondraient à des années plus comparables avec les autres départements.

### Copie des données vers l'application

60+ tables de données précalculées sont copiées de la base de calcul (ETL) vers la base applicative. Cette séparation est nécessaire car :
- Les calculs avec l'OCS GE France entière consomment énormément de stockage, incompatible avec un serveur applicatif
- L'application est hébergée sur un service managé où le stockage de base de données est limité et coûteux, contrairement au serveur dédié de l'ETL

La copie est un **remplacement complet** (pas incrémental) pour garantir l'idempotence. Elle dure au maximum 10 minutes et entraîne un court downtime de l'application. 

### Tuiles vectorielles

Les données cartographiques (occupation du sol, artificialisation, imperméabilisation, zonage d'urbanisme, friches, carroyage) sont pré-générées sous forme de **tuiles vectorielles au format PMTiles**. Ce format permet un affichage cartographique rapide et fluide : seules les données visibles à l'écran sont chargées, et les géométries sont simplifiées en fonction du niveau de zoom (moins de détail quand on est dézoomé, précision maximale quand on zoome). Cela rend possible la navigation sur l'ensemble du territoire national sans temps de chargement perceptible, y compris à la parcelle.

---

## Sources de données

### Données géospatiales (IGN)
- **OCS GE** : occupation du sol à grande échelle, produite département par département avec des millésimes variables
- **Admin Express** : limites administratives (communes, EPCI, départements, régions) selon le COG 2024
- **GPU** : documents d'urbanisme et zonage (zone_urba)

### Données statistiques (INSEE)
- **Population** : données historiques 1876-2022
- **COG** : changements du Code Officiel Géographique (fusions, scissions)
- **Dossier complet** : recensement détaillé (1900+ variables) couvrant emploi, logement, CSP, entreprises, équipements, tourisme, revenus/pauvreté

### Données foncières et environnementales (Cerema)
- **MAJIC** : données foncières, source principale pour la consommation d'espaces
- **Cartofriches** : inventaire national des friches
- **PENE** : zones prioritaires pour la renaturation
- **Carroyage LEA** : consommation d'espaces sur grille

### Données logement
- **SITADEL** : permis de construire (communes, départements, EPCI)
- **RPLS** : répertoire des logements sociaux (communes, départements, régions)
- **ZLV** : consommation d'espaces par zonage (Zéro Logement Vacant)

### Données d'urbanisme
- **SUDOCUH** : données habitat communales et intercommunales
- **SCOT** : schémas de cohérence territoriale (via docurba.beta.gouv.fr)

---

## Niveaux territoriaux

L'application supporte une hiérarchie de territoires :

| Niveau | Description |
| --- | --- |
| **Commune** | Niveau le plus fin, unité de base des calculs |
| **EPCI** | Établissements publics de coopération intercommunale |
| **SCoT** | Schémas de cohérence territoriale |
| **Département** | Niveau départemental |
| **Région** | Niveau régional |
| **Nation** | France entière |
| **Territoire personnalisé** | Périmètres définis par l'utilisateur |

Les calculs sont effectués au niveau communal puis agrégés vers les niveaux supérieurs. L'application **ne gère pas les diagnostics à l'échelle infra-communale** (arrondissements, quartiers, sections cadastrales, etc.) : la commune est le niveau le plus fin. Une prise en charge de l'infra-communal nécessiterait une adaptation conséquente de l'ensemble de la chaîne de données et de l'application.

Les outre-mer sont gérés avec des systèmes de coordonnées spécifiques (Guadeloupe, Guyane, Martinique, Réunion, Mayotte).

---

## Classification OCS GE

L'OCS GE utilise deux axes de classification :

- **Couverture du sol (CS)** : description physique du sol (bâti, routes, végétation, eau, etc.)
- **Usage du sol (US)** : fonction socio-économique (résidentiel, activité, agriculture, etc.)

Le croisement CS × US permet de déterminer :
- **L'artificialisation** : un sol est considéré comme artificialisé selon une combinaison de codes CS et US définie réglementairement. Ce calcul est effectué directement par l'IGN dans les données OCS GE livrées.
- **L'imperméabilisation** : un sol est considéré comme imperméable selon ses codes de couverture. Ce calcul est effectué par l'ETL du projet à partir des données OCS GE brutes.

Les **flux** mesurent les changements entre deux millésimes (artificialisation, désartificialisation, imperméabilisation, désimperméabilisation). Les **stocks** mesurent l'état courant de l'occupation à un millésime donné.

---

## Fonctionnalités de l'application

### Diagnostic territorial

L'application permet à un utilisateur de sélectionner un territoire et d'accéder à un diagnostic complet comprenant :

- **Synthèse** : vue d'ensemble des indicateurs clés (KPIs)
- **Consommation d'espaces NAF** : tendances annuelles, comparaisons inter-territoriales, croisements démographiques, analyse par carroyage, cartes bivariées
- **Artificialisation** : taux, flux nets, répartition par couverture/usage, impact par zonage d'urbanisme, détail des territoires enfants
- **Imperméabilisation** : même structure que l'artificialisation
- **Friches** : inventaire, statuts de gisement, couverture OCS GE
- **Logements vacants** : statistiques, autorisations, comparaisons (avec secrétisation)
- **Résidences secondaires** : analyse (accès réservé aux membres DGALN)
- **Trajectoires** : objectifs 2031, chemins de sobriété, suivi de progression
- **Rapport local** : génération de rapports triennaux réglementaires
- **Téléchargements** : export PDF des diagnostics, gestion de brouillons éditables

### Comparaison de territoires

L'utilisateur peut comparer son territoire avec des territoires similaires (automatiquement identifiés) ou avec des territoires de son choix. Les comparaisons portent sur la consommation d'espaces, l'artificialisation, la démographie, etc.

### Cartographie interactive

L'application propose 10 types de cartes interactives couvrant l'occupation du sol, l'artificialisation, l'imperméabilisation, le zonage d'urbanisme, les friches et le carroyage. Les données sont servies sous forme de tuiles vectorielles PMTiles pour des performances optimales.

### Publication de données ouvertes

L'application publie des jeux de données sur **data.gouv.fr** :
- Tuiles vectorielles (PMTiles) pour la visualisation cartographique
- Données d'imperméabilisation communales
- Exports en formats CSV et GeoPackage
