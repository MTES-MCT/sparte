# Fichiers de configuration

Guide des fichiers de configuration situés à la racine du projet.

## Projet

| Fichier | Description |
|---------|-------------|
| `Makefile` | Commandes de développement (`make install`, `make start`, `make test`, etc.) |
| `.gitignore` | Fichiers ignorés par Git |
| `LICENSE` | Licence du projet |
| `README.md` | Documentation d'installation et variables d'environnement |

## Environnement

| Fichier | Description |
|---------|-------------|
| `.env` | Variables d'environnement locales (non versionné) |
| `.env.example` | Template des variables d'environnement à copier en `.env` |

## Docker & Déploiement

| Fichier | Description |
|---------|-------------|
| `Dockerfile` | Image Docker du backend Django (Python 3.11 + GDAL) |
| `Dockerfile.frontend` | Image Docker du frontend (Node 20 + Webpack dev server) |
| `docker-compose.yml` | Orchestration des services : PostgreSQL, Redis, S3 local, Django, frontend, export-server |
| `Procfile` | Point d'entrée pour le déploiement Scalingo (Gunicorn) |
| `scalingo.json` | Configuration de déploiement Scalingo |
| `.buildpacks` | Buildpacks utilisés par Scalingo (Python + Node + GDAL) |
| `.slugignore` | Fichiers exclus du slug Scalingo |
| `.dockerignore` | Fichiers exclus du contexte Docker |
| `Aptfile` | Paquets système Debian installés au déploiement (GDAL, etc.) |

## Python / Django

| Fichier | Description |
|---------|-------------|
| `Pipfile` | Dépendances Python (pipenv) |
| `Pipfile.lock` | Versions verrouillées des dépendances Python |
| `pyproject.toml` | Configuration des outils Python : Black (formatage), isort (imports), djlint (templates) |
| `pytest.ini` | Configuration de pytest (options, répertoire de tests) |
| `.bandit` | Configuration de Bandit (analyse de sécurité Python) |
| `flake8` | Configuration de Flake8 (linting Python) |
| `.python-version` | Version de Python utilisée (3.11) |
| `manage.py` | CLI Django (migrations, serveur, commandes custom) |
| `required_parameters.json` | Paramètres par défaut chargés en base via `manage.py load_param` |

## Frontend (JavaScript / TypeScript)

| Fichier | Description |
|---------|-------------|
| `package.json` | Dépendances Node.js et scripts npm (dev, build, test, lint) |
| `package-lock.json` | Versions verrouillées des dépendances Node.js |
| `webpack.config.js` | Configuration Webpack (bundling, dev server, loaders, aliases) |
| `tsconfig.json` | Configuration TypeScript (paths, compilation) |
| `babel.config.js` | Configuration Babel (transpilation JSX/TypeScript) |
| `jest.config.js` | Configuration Jest (tests unitaires frontend) |
| `jest.setup.js` | Setup global des tests Jest |

## Qualité & CI

| Fichier | Description |
|---------|-------------|
| `.pre-commit-config.yaml` | Hooks pre-commit (Black, isort, flake8, etc.) |
| `.github/` | Workflows GitHub Actions (CI/CD) |
| `sonar-project.properties` | Configuration SonarQube (analyse de code) |
