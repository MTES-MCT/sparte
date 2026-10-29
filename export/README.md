# Sparte Export API

Service Node.js/TypeScript pour l'export des rapports Sparte en PDF via Puppeteer.

## Fonctionnalités

- API REST pour générer des PDFs de rapports
- Utilise Puppeteer pour le rendu
- Validation des hosts autorisés (sécurité SSRF)
- Header et footer personnalisables via URLs
- Intégré dans Docker Compose

## Endpoints

### Health Check
```
GET /health
```

Retourne le statut du service.

### Export PDF
```
GET /api/export?url=<page_url>&headerUrl=<header_url>&footerUrl=<footer_url>
```

Paramètres (tous requis) :
- `url` : URL de la page à exporter en PDF
- `headerUrl` : URL du template HTML pour le header du PDF
- `footerUrl` : URL du template HTML pour le footer du PDF

Retourne un PDF. Si `EXPORT_API_TOKEN` est défini, l'en-tête `X-Export-Token` doit contenir ce jeton (sinon 401).

Exemple :
```bash
curl "http://localhost:3001/api/export?url=http://localhost:8080/exports/rapport-complet/COMM/69123&headerUrl=http://localhost:8080/exports/pdf-header&footerUrl=http://localhost:8080/exports/pdf-footer" \
  --output rapport.pdf
```

## Variables d'environnement

- `PORT` : Port du serveur (défaut: 3001 en dev)
- `ALLOWED_HOSTS` : Liste des hosts autorisés, séparés par des virgules (requis)
- `EXPORT_API_TOKEN` : Jeton exigé dans l'en-tête `X-Export-Token` (égal à `EXPORT_SERVER_TOKEN` côté Django). Vide : aucun jeton exigé

Exemple :
```bash
ALLOWED_HOSTS=localhost,mondiagartif.beta.gouv.fr
```

## Sécurité

Le service valide toutes les URLs (page, header, footer) :
- Seuls les protocoles `http:` et `https:` sont autorisés
- Le hostname doit être dans la liste `ALLOWED_HOSTS`
- Retourne une erreur 403 si l'host n'est pas autorisé
- Les gabarits d'en-tête et de pied de page sont chargés sans suivre de redirection

Pendant le rendu, le navigateur :
- garde la politique de même origine et la vérification des certificats (aucune option qui les désactive)
- n'ouvre que des pages (navigation, iframe, redirection) d'un host de `ALLOWED_HOSTS`
- refuse toute requête vers une adresse locale ou privée (`localhost`, `127.0.0.1`, `10.x`, `169.254.x`…), sauf un host de `ALLOWED_HOSTS`

## Développement local

### Installation
```bash
npm install
```

### Lancer le serveur de dev
```bash
npm run dev
```

Le service sera disponible sur `http://localhost:3001`

### Build
```bash
npm run build
```

### Tests
```bash
npm test
npm run test:watch  # Mode watch
```

### Utilisation CLI

Le script CLI permet d'exporter des rapports en ligne de commande :

```bash
# Usage
npm run cli -- <url> [output_path] [header_url] [footer_url]

# Exemple
npm run cli -- "http://localhost:8080/exports/rapport-complet/COMM/69123" rapport.pdf "http://localhost:8080/exports/pdf-header" "http://localhost:8080/exports/pdf-footer"
```

## Architecture

```
export/
├── src/
│   ├── api.ts              # Serveur Express API
│   ├── cli.ts              # Script CLI
│   ├── pdf-generator.ts    # Logique de génération PDF
│   ├── url-validation.ts   # Validation des URLs et hosts
│   └── url-validation.test.ts  # Tests
├── dist/                   # Code compilé (généré par tsc)
├── package.json            # Dépendances npm
└── tsconfig.json           # Configuration TypeScript
```

### Stack technique
- **TypeScript 5.3+** : Type safety et meilleur DX
- **Express 4** : API REST
- **Puppeteer 24** : Génération PDF via Chromium
- **Vitest** : Tests unitaires
- **tsx** : Exécution TypeScript en développement
