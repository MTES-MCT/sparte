# Aide Mon Diag Artif

Site statique Astro avec Starlight (navigation et recherche), servi sous `/aide/`.
L'image Docker compile les fichiers Markdown puis sert uniquement le resultat avec nginx.


## Lancer avec Docker

Depuis la racine du depot :

```sh
docker compose up -d --build aide
```

Le site est accessible sur http://localhost:8890/aide/ via le proxy existant.
Le service ecoute aussi sur le port 6000 :

```sh
curl -I http://localhost:6000/aide/
```


## Organisation du contenu

- `src/content/docs/index.md` : l'accueil ;
- `src/content/docs/category/` : les pages de categories ;
- `src/content/docs/article/` : les articles avec leur URL source en en-tete ;
- `src/content/navigation.json` : la navigation par categories et sous-rubriques.

Les six articles en vedette sont des liens statiques dans `src/content/docs/index.md`.



## Ajouter ou modifier une page

Modifier un article dans `src/content/docs/article/` ou y creer un fichier `.md`,
avec un en-tete :

```md
---
title: Mon guide
description: Description du guide.
---

## Premiere section

Contenu du guide.
```

Le fichier `article/mon-guide.md` devient `/aide/article/mon-guide/`. Pour une
nouvelle page, ajouter une entree `{ "label": "Mon guide", "slug": "article/mon-guide" }`
dans la rubrique souhaitee de `src/content/navigation.json`.
Les liens internes doivent inclure `/aide/`.
Les images peuvent etre placees dans `public/images/` puis referencees par
`![Description](/aide/images/mon-image.png)`.

