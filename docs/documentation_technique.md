# Questions en suspens :


## Architecture technique

### Pourquoi deux bases de données ?

Le projet utilise une base ETL (Airflow/dbt) et une base applicative (Django). Les tables sont copiées de l'une à l'autre via `update_app.py` (60+ tables avec ogr2ogr).

**Questions :**

- Pourquoi ne pas requêter directement la base ETL depuis Django ? **Réponse :** Séparer les calculs lourds (ETL) d'une production légère (Django), qui ne contient que des données précalculées. Les calculs avec l'OCS GE France entière consomment énormément de mémoire, ce qui est incompatible avec un serveur applicatif. De plus, l'application est hébergée sur un service managé où le stockage de BDD est limité et coûteux, contrairement au VPS sur lequel l'ETL et sa BDD sont hébergés.
- Pourquoi utiliser ogr2ogr pour copier des tables non-géographiques ? **Réponse :** Pour garder le même script de copie de données et ne pas multiplier les logiques.
- La copie est-elle incrémentale ou un remplacement complet ? **Réponse :** Remplacement complet, pour assurer l'idempotence.

### Pourquoi des modèles Django "unmanaged" ?

50+ modèles dans `public_data/` sont `managed = False`. Ils ne sont pas créés par les migrations Django mais par les DAGs Airflow/dbt.

**Questions :**

- Comment les tests fonctionnent sans ces tables ? (`init_unmanaged_schema_for_tests()` dans `utils/schema.py`) **Réponse :** Les modèles non managés sont créés (avec `init_unmanaged_schema_for_tests`) et en fonction des besoins, des fixtures sont créées afin d'avoir le contexte suffisant à l'exécution des tests.
- Que se passe-t-il si le schéma dbt diverge du modèle Django ? **Réponse :** En général l'application ne fonctionne pas et le problème est identifié avant les étapes UAT et de MEP.
- Pourquoi ne pas générer les modèles Django depuis le schéma dbt ? **Réponse :** Évolution produit envisagée mais pas prioritaire.

### Pattern multi-root React

`react-roots.tsx` crée 6 `createRoot()` indépendants sur des éléments DOM différents (#react-root, #react-search-bar, etc.).

**Questions :**

- Pourquoi pas un seul root React pour toute l'application ? **Réponse :** L'application a été initialement construite entièrement en Django avec HTMX. Cette architecture a montré ses limites (interactivité, maintenabilité). Le projet est actuellement dans une phase hybride de migration : certaines pages sont encore rendues par des templates Django, tandis que d'autres sont gérées par une SPA React avec router. Les multiples roots reflètent cette cohabitation. À terme, l'objectif est de n'avoir qu'un seul template Django servant de point d'entrée à une SPA React unique avec router.

### Container d'injection de dépendances

`public_data/domain/containers.py` utilise `dependency_injector` pour créer des services.

**Questions :**

- Pourquoi utiliser l'injection de dépendances dans un projet Django ? **Réponse :** C'est une erreur de parcours. L'idée initiale était d'avoir une interface claire entre les données et leurs utilisations (graphiques, cartes, etc.), mais l'injection de dépendances et le container sont redondants avec les modèles dbt (for_app), dont le format est uniquement pensé pour l'application. Quand des cas d'usages différents existent, les modèles sont dupliqués côté dbt, ce qui rend les services et le container inutiles côté back. Idéalement, il faudrait requêter directement les tables et retirer les services.

---

## Logique métier

### Correction des données de consommation

`ConsommationCorrectionStatus` définit 5 états. Le script de correction (`consommation_cog_2024.sql`) aligne les données MAJIC (source Cerema) sur le COG 2024 en corrigeant les cas où le code commune source ne correspond pas au découpage administratif actuel.

**Les 5 statuts de correction :**

| Statut | Description | Exemple dans le script |
| --- | --- | --- |
| **UNCHANGED** | Données inchangées par rapport à la source MAJIC. Cas par défaut pour les communes dont le code n'a pas changé. | Toutes les communes non listées dans les exclusions |
| **COG_ERROR** | Le code commune source ne correspond pas au COG actuel. La consommation est redistribuée via la macro `divide_majic` au prorata de la surface. | `60054` → scindée en `60054` (42.24%) + `60694` (57.76%) ; `85084` → scindée en 3 communes |
| **DIVISION** | Les données sont divisées par un coefficient de surface basé sur les divisions du dernier COG. | *(Même mécanisme que COG_ERROR via `divide_majic`)* |
| **MISSING_FROM_SOURCE** | Communes absentes de la source MAJIC. Toutes les consommations sont mises à 0 (coefficient 0%). Concerne principalement des communes d'outre-mer et des cas particuliers. | `09304`, `29083`, `29084`, `97601`–`97617` (communes ultramarines) |

La macro `divide_majic(initial_code, final_code, percent)` multiplie toutes les colonnes de consommation (par année et par destination) par `percent / 100`, ce qui répartit la consommation au prorata de la surface.

**Questions :**

- Comment la correction est-elle appliquée lors d'une fusion de communes ? **Réponse :** Nous additionnons toutes les consommations des communes fusionnées.
- Comment sont répartis les consommations lors d'une scission ? **Réponse :** Au prorata de la surface du territoire. Cette solution est imparfaite et mériterait d'être remplacée par une méthode plus représentative (population ? ménages ? autre ?). Cela dit, cela concerne très peu de communes. Idéalement, cela devrait être corrigé à la source côté Cerema.

### Trois niveaux d'objectifs de réduction

Un territoire peut avoir un objectif :

1. **Territorial** (depuis un document d'urbanisme) — réglementaire et territorialisé
2. **Hérité du parent** — non réglementaire, suggéré
3. **Custom** (saisi par l'utilisateur) — correspond à l'objectif national par défaut, non réglementaire

**Questions :**

- Le custom est-il visible par d'autres utilisateurs ? **Réponse :** Non.

### Territorialisation des objectifs

La territorialisation est gérée par le modèle `TerritorialisationObjectif` (`public_data/models/territorialisation/`), qui lie un territoire à un objectif de réduction (pourcentage), un territoire parent, et un document d'urbanisme source (nom, URL, indicateur d'inscription).

**Composants impliqués :**
- **Backend** : `TerritorialisationObjectif` (modèle), `TerritorialisationObjectifAdmin` (admin Django), fixture `territorialisation_objectif.json`
- **Frontend** : page Trajectoires (`frontend/scripts/components/pages/Trajectoires/`), contexte `TrajectoiresContext.tsx` qui calcule la consommation autorisée et les projections
- **API** : `UpdatePreferenceTarget2031APIView` pour l'objectif personnalisé, données de territorialisation incluses dans la réponse `landData`
- **Graphiques** : `TerritorialisationMap`, `TerritorialisationProgressMap`, `ObjectiveChart` et variantes

**Accès restreint** : la fonctionnalité est conditionnée par l'appartenance au groupe Django `DGALN` (`currentUser.groups.includes("DGALN")`). Le booléen `hasTerritorialisation` dans `TrajectoiresContext.tsx` combine cette condition avec la présence d'un objectif (`territorialisation?.has_objectif`).

**Pour ouvrir la fonctionnalité à tous les utilisateurs** : retirer la condition `isDGALNMember` dans `TrajectoiresContext.tsx` (ligne `const hasTerritorialisation = isDGALNMember && (territorialisation?.has_objectif ?? false)` → remplacer par `const hasTerritorialisation = territorialisation?.has_objectif ?? false`). Vérifier également les conditions de visibilité dans `TrajectoiresObjectifs.tsx` et `buildNavbar()` dans `projectUrls.ts` qui peuvent filtrer les éléments de navigation selon le rôle DGALN.

### Période de référence 2011-2020

L'objectif ZAN compare la consommation 2021-2031 à la moyenne 2011-2020.

**Questions :**

- Pourquoi 2011-2020 et pas 2011-2021 ? **Réponse :** Parce que 2011-2020 représente exactement 10 ans, alors que 2011-2021 en ferait 11. La loi Climat et Résilience impose explicitement une réduction de 50 % par rapport à la consommation de la **décennie** précédente, sans préciser les bornes exactes. Ce flou est source de nombreuses erreurs d'interprétation : beaucoup d'acteurs (collectivités, bureaux d'études) se trompent sur cette période de référence. C'est un point de vigilance majeur pour l'application, car une mauvaise période fausse le calcul de l'objectif de réduction et peut induire les territoires en erreur.

### Décalage temporel des croisements INSEE

Les recensements INSEE (2011, 2016, 2022) ne correspondent pas à la période de référence de 2011-2020.

**Questions :**

- Comment est géré l'alignement temporel ?
- Pourquoi ne pas interpoler les données démographiques annuellement ?

### Seuils de secretisation (logements vacants)

`LogementsVacantsStatus` a 10+ valeurs incluant "partiellement_secretise".

**Questions :**

- Qu'est-ce que la secrétisation ? Une règle du secret statistique ? **Réponse :** Oui, c'est l'application du secret statistique : lorsqu'un territoire compte moins de 11 logements vacants, les données ne sont pas affichées afin de protéger la vie privée des propriétaires (le risque étant qu'avec si peu de logements, il serait possible d'identifier les biens concernés). Ce seuil est une convention classique du secret statistique français.
- Quels seuils déclenchent la secrétisation ? **Réponse :** Moins de 11 logements vacants sur le territoire. Voir ci-dessus.
- Comment l'interface affiche un territoire partiellement secrétisé ? **Réponse :** Un message informatif est affiché en haut de la page. Pour les territoires de niveau supérieur à la commune (EPCI, département, etc.), les communes secrétisées apparaissent grisées.

### Statut des friches (gisement)

4 niveaux de "gisement" pour les friches, calculés dans `land_friche_status.sql` à partir des surfaces par statut de friche (sans projet, avec projet, reconvertie) :

| Gisement | Condition |
| --- | --- |
| **gisement nul et sans potentiel** | Aucune surface de friche (sans projet = 0, avec projet = 0, reconvertie = 0) |
| **gisement nul car potentiel déjà exploité** | Pas de friche sans projet, mais des friches avec projet et/ou reconverties |
| **gisement potentiel et non exploité** | Des friches sans projet, mais aucune avec projet ni reconvertie |
| **gisement potentiel et en cours d'exploitation** | Des friches sans projet ET des friches avec projet et/ou reconverties |

**Questions :**

- Comment passe-t-on d'un niveau à l'autre ? **Réponse :** La logique repose sur trois axes : s'il y a des friches sans projet, le gisement est **potentiel**, sinon il est **nul**. Le caractère "exploité" dépend de la présence de friches reconverties. Le caractère "en cours d'exploitation" dépend de la présence de friches avec projet.

### Territoires interdépartementaux et OCS GE

L'OCS GE (Occupation du Sol à Grande Échelle) est produite par l'IGN **département par département**, avec des millésimes (années de référence) qui varient selon les départements. Certains territoires (EPCI, SCoT, régions) s'étendent sur plusieurs départements, ce qui crée des enjeux de couverture et d'agrégation.

**Comment les territoires interdépartementaux sont-ils identifiés ?**

Chaque territoire possède un tableau `departements` (construit dans `land.sql`) et un booléen `is_interdepartemental` (dans `land_details.sql`), à `true` dès que le territoire couvre plus d'un département.

**Comment l'OCS GE est-elle agrégée pour un territoire interdépartemental ?**

Les données OCS GE (artif, imper) sont d'abord calculées à la **commune**, puis agrégées vers les niveaux supérieurs (EPCI, SCoT, région, nation) via des macros dbt (`merge_ocsge_indicateur_commune_by_admin_level`). Le champ `departement` est préservé tout au long de la chaîne pour tracer l'origine des données.

**Que se passe-t-il quand un territoire interdépartemental n'a pas l'OCS GE sur tous ses départements ?**

Le modèle `land_ocsge_status.sql` compare le nombre de départements du territoire au nombre de millésimes disponibles. Le statut résultant est :

| Statut | Condition |
| --- | --- |
| **COMPLETE_UNIFORM** | 1 département, 2 millésimes disponibles |
| **COMPLETE_NOT_UNIFORM** | N départements, 2×N millésimes disponibles (toutes les données sont là, mais les années peuvent différer) |
| **PARTIAL** | N départements, mais moins de 2×N millésimes (données incomplètes) |
| **PARTIAL_DUE_TO_PRODUCTOR_ISSUE** | Cas spécial Guyane — données incomplètes à cause du producteur |
| **NO_DATA** | Aucun millésime disponible |

**Pourquoi utiliser un `index` de millésime (millesime_index) plutôt que les années directement ?**

Chaque département a ses propres années OCS GE (ex: département A a 2018 et 2021, département B a 2019 et 2023). Pour pouvoir comparer et agréger les données entre départements, on attribue un **index séquentiel** par département (`row_number() over (partition by departement order by year)` dans `millesimes.sql`). L'index 1 correspond au premier millésime disponible, l'index 2 au second. Cela permet de calculer des flux (artif/désartif) entre "index 1 → index 2" de manière homogène, même si les années réelles diffèrent d'un département à l'autre. Sans cet index, il serait impossible d'additionner les flux d'un EPCI interdépartemental dont les communes ont des millésimes différents.

---

### 60 tables copiées par update_app

`update_app.py` copie 60+ tables de la base ETL vers la base applicative.

**Questions :**

- Combien de temps prend cette copie ? **Réponse :** Au maximum 10 minutes.
- Y a-t-il un downtime pour l'application ? **Réponse :** Oui.
- Les index sont-ils recréés à chaque copie ? **Réponse :** Oui.
- Pourquoi ne pas utiliser des foreign data wrappers PostgreSQL ? **Réponse :** L'objectif est de maintenir une séparation stricte entre la base ETL (calculs lourds, VPS) et la base applicative (production légère, service managé coûteux en stockage). Un FDW créerait un couplage réseau entre les deux bases et ferait peser les requêtes de l'application sur la base ETL, ce qui va à l'encontre de cette logique de séparation.

### Vector tiles

8 DAGs génèrent des tuiles vectorielles pour différentes couches.

**Questions :**

- Comment les tuiles sont-elles servies ? Depuis S3 directement ? **Réponse :** Oui. Les tuiles sont stockées au format PMTiles, un format d'archive unique qui regroupe toutes les tuiles vectorielles dans un seul fichier. Le client (MapLibre) exploite les HTTP Range Requests (partial content, code 206) pour ne télécharger que les fragments du fichier correspondant à la zone et au niveau de zoom demandés, sans avoir besoin d'un serveur de tuiles intermédiaire. S3 supporte nativement les Range Requests, ce qui permet de servir les tuiles directement depuis le bucket.

---

## Frontend

### Highcharts : deep clone systématique

`GenericChart.tsx` clone en profondeur toutes les options Highcharts avec `JSON.parse(JSON.stringify(...))`.

**Questions :**

- Pourquoi Highcharts mute les options ? **Réponse :** Highcharts n'est pas parfaitement compatible avec React et provoque des bugs d'affichage si les options ne sont pas clonées en profondeur avant chaque rendu.
- L'impact performance est-il mesuré sur les grosses cartes ? **Réponse :** Négligeable.
- La suppression de `responsive` est-elle toujours nécessaire ? **Réponse :** Oui, c'est un bug Highcharts.

### Mélange Bootstrap + DSFR + styled-components

Le CSS combine trois systèmes : classes DSFR (`fr-*`), classes Bootstrap (`d-flex`, `w-100`), et styled-components.

**Questions :**

- Pourquoi garder Bootstrap si le DSFR est utilisé ? **Réponse :** Bootstrap est historiquement présent dans l’application et reste utilisé dans certaines parties existantes. Il est considéré comme legacy sur le projet et est remplacé au fil de l’eau.
- Pourquoi le DSFR n’est pas utilisé seul ? **Réponse :** Bien que le DSFR soit le design system cible, il est principalement conçu pour des sites institutionnels (pages éditoriales, formulaires, parcours utilisateur). Notre application étant un dashboard, certains besoins d’interface ne sont pas couverts. Pour répondre à ces besoins, l’application utilise styled-components pour créer des composants stylés spécifiques ainsi qu’un fichier de thème qui surcharge certaines variables du DSFR, de manière similaire à un thème enfant.

---

## Sécurité et authentification

### ProConnect : JWT au lieu de JSON standard

`oidc/backends.py` gère un cas où ProConnect retourne un JWT au lieu de JSON pour le userinfo.

**Questions :**

- Est-ce un bug ProConnect ou un choix délibéré ? **Réponse :** C'est un choix délibéré de ProConnect. L'endpoint userinfo retourne un JWT signé (`application/jwt`) plutôt que du JSON standard, ce qui est plus sécurisé car vérifiable côté client. La librairie `mozilla_django_oidc` ne gère pas ce cas nativement, d'où la surcharge de `get_userinfo()` qui détecte le Content-Type et décode le JWT si nécessaire.
- Ce workaround est-il encore nécessaire ? **Réponse :** Oui, tant que ProConnect retourne du JWT pour le userinfo et que `mozilla_django_oidc` ne le supporte pas nativement.

### Nonce CSP via placeholder

`ForceNonceCSPMiddleware` remplace `[NONCE_PLACEHOLDER]` dans le HTML par un vrai nonce.

**Questions :**

- Pourquoi ne pas utiliser le mécanisme natif de django-csp ? **Réponse :** C'est une dette technique liée à l'utilisation de HTMX, qui nécessite un nonce dans la config meta `htmx-config`. L'utilisation simple du mécanisme natif de django-csp devrait être possible à l'avenir, une fois HTMX retiré.
- Le remplacement textuel dans la réponse est-il fiable (risque sur les contenus binaires) ? **Réponse :** Oui, c'est fiable. Le middleware filtre les contenus binaires connus par Content-Type (PDF, images, octet-stream) et gère les `UnicodeDecodeError` en fallback. Le placeholder `[NONCE_PLACEHOLDER]` est suffisamment spécifique pour éviter des remplacements accidentels. Le seul risque théorique serait qu'un utilisateur injecte littéralement `[NONCE_PLACEHOLDER]` dans un champ texte affiché dans le HTML, mais connaître le nonce d'une réponse qu'on reçoit soi-même n'apporte rien à un attaquant. C'est juste pas élégant comparé au mécanisme natif de django-csp, mais ça fait le travail.

---

## Divers

### AdminRef.get_class() ignore le paramètre

`AdminRef.get_class()` retourne toujours `LandModel` quel que soit le `name` passé.

**Question :** Bug ou choix d'architecture (tous les types dans une seule table) ? **Réponse :** Dette technique liée à du code legacy. Historiquement, il y avait un modèle Django distinct par type de territoire (Commune, EPCI, Département, etc.). Ces modèles ont été fusionnés dans un unique `LandModel`, mais `get_class()` n'a pas été nettoyé. Il pourrait être remplacé par un appel direct à `LandModel`.