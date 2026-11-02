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
8. Suppression du rapport de test.

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

## Limites connues

- Chaque exécution crée un utilisateur dans la base locale (non supprimé : il n'existe pas de
  parcours de suppression de compte sans e-mail). Le rapport créé est, lui, supprimé en fin de test.
- Le formulaire d'inscription refuse toute soumission moins de 3 s après l'affichage (jeton anti-spam) :
  le test attend donc 3,5 s avant de valider.
- La génération du PDF dépend du conteneur `export-server` (Puppeteer) et du bucket S3 local. Si le
  serveur d'export est indisponible, la demande est acceptée mais le statut passe à `failed` : le test
  échoue en affichant l'erreur renvoyée par Django.
- Aucune validation d'adresse e-mail n'est demandée à l'inscription : la connexion est immédiate.
- Les tests Jest (`npm test`) ignorent ce dossier.
