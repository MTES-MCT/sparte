# Tests end-to-end (Playwright)

Les tests de ce dossier pilotent un vrai navigateur (Chromium) contre une
application **déjà lancée** : Playwright ne démarre aucun serveur.

## Parcours couvert

`rapport-utilisateur.spec.ts` rejoue le parcours complet d'un nouvel utilisateur :

1. Inscription (`/users/signup/`) avec un e-mail jetable `e2e-<horodatage>@example.com`.
2. Complétion du profil (`/users/complete-profile/`) : organisme et territoire principal.
3. Déconnexion (`/users/signout/`) puis reconnexion (`/users/signin/`), vérification via `/api/me/`.
4. Recherche d'un territoire depuis la page d'accueil (`/`), sélection d'un résultat.
5. Ouverture du diagnostic (`/diagnostic/commune/69123-lyon` par défaut).
6. Création d'un rapport complet depuis « Générer un rapport » (`/diagnostic/<type>/<slug>/telechargements`).
7. Export PDF : la demande (`/diagnostic/export/start/`) est acceptée, le polling
   (`/diagnostic/export/status/<job>/`) aboutit à `completed`, le fichier téléchargé commence par `%PDF-`.
8. Suppression du rapport de test, puis du compte de test (`/users/unsubscribe/`).

## Pré-requis

- L'application tourne en local : `make start` (Django sur <http://localhost:8080>, serveur
  d'export `export-server` et bucket S3 local inclus dans `docker-compose.yml`).
- La base locale contient le territoire recherché (Lyon, code INSEE 69123, par défaut).
- Dépendances installées (`npm ci`) et navigateur Playwright téléchargé :

```bash
npx playwright install chromium
```

## Lancer les tests

```bash
npm run test:e2e
```

Options utiles :

```bash
npx playwright test --headed            # voir le navigateur
npx playwright test --debug             # pas à pas
npx playwright show-report              # rapport HTML du dernier run
```

Variables d'environnement :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `E2E_BASE_URL` | `http://localhost:8080` | URL de l'application testée |
| `E2E_TERRITOIRE_RECHERCHE` | `Lyon` | Texte saisi dans la barre de recherche |
| `E2E_TERRITOIRE_CODE_INSEE` | `69123` | Code INSEE du résultat à sélectionner |
| `E2E_TERRITOIRE_URL` | `/diagnostic/commune/69123-lyon` | URL attendue du diagnostic |

Les traces et captures d'écran des échecs sont dans `test-results/`, le rapport HTML dans
`playwright-report/` (tous deux ignorés par git).

## Exécution dans la CI (GitHub Actions)

Le job `test-e2e` de `.github/workflows/pr.yml` rejoue le parcours à chaque push, sans
docker-compose : il installe la pile directement sur le runner.

1. Service Postgres/PostGIS (`postgis/postgis:17-3.5`), `manage.py migrate`.
2. `manage.py e2e_setup_db` : crée (vides) les tables `public_data` non gérées par Django,
   normalement produites par dbt/Airflow, puis charge la fixture d'un seul territoire
   `public_data/fixtures/e2e/land_COMM_69123.json` (Lyon).
3. Bucket S3 factice `versity/versitygw` (`docker run`, port 7070) pour stocker les PDF exportés.
4. Serveur d'export Puppeteer (`export/`, port 3001), Django `runserver --insecure` (port 8080,
   `DEBUG=0`, `USE_CSP=0`, `USE_SRI=0`, bundle webpack construit par `npm run build`).
5. `npx playwright install --with-deps chromium` puis `npm run test:e2e`.

En cas d'échec, les logs Django et export-server sont affichés et le rapport Playwright
(`playwright-report/`, `test-results/`) est publié en artefact.

### Fixture d'un territoire

La fixture contient les lignes de Lyon (commune 69123) dans les tables `public_data` non gérées :
`LandModel` (avec géométrie), consommation (`LandConso`, `LandConsoStats`), population
(`LandPop`, `LandPopStats`, `LandPopulationDensity`), artificialisation / imperméabilisation
(stocks, flux, compositions, zonages), friches, logements vacants, autorisations de logement et
dossier complet INSEE (`LandDc*`). Sont volontairement exclus : `LandCarroyageBounds` et
`BivariateLandRate` (plusieurs centaines de lignes inutiles au parcours), `NearestTerritories`
(les voisins ne sont pas dans la fixture) et `ImperZonage` (schéma local divergent du modèle).
Les tables exclues existent quand même, vides.

Pour la régénérer depuis une base locale complète (lecture seule) :

```bash
docker compose exec django python manage.py e2e_dump_land --land-type COMM --land-id 69123 --output public_data/fixtures/e2e/land_COMM_69123.json
```

Pour changer de territoire, adapter `--land-type` / `--land-id`, le nom du fichier
(`--fixture` de `e2e_setup_db` ou sa valeur par défaut) et les variables `E2E_TERRITOIRE_*`.
Le territoire doit avoir `has_conso` vrai et `is_diagnosticable` vrai.

## Limites connues

- Le test supprime en fin de parcours le rapport puis le compte qu'il a créés. Si le test échoue
  avant, un utilisateur `e2e-<horodatage>@example.com` reste dans la base cible.
- Le formulaire d'inscription refuse toute soumission moins de 3 s après l'affichage (jeton anti-spam) :
  le test attend donc 3,5 s avant de valider.
- La génération du PDF dépend du conteneur `export-server` (Puppeteer) et du bucket S3 local. Si le
  serveur d'export est indisponible, la demande est acceptée mais le statut passe à `failed` : le test
  échoue en affichant l'erreur renvoyée par Django.
- Aucune validation d'adresse e-mail n'est demandée à l'inscription : la connexion est immédiate.
- Les tests Jest (`npm test`) ignorent ce dossier.
