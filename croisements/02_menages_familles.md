# Croisement 2 : Menages et familles x Consommation

## Variables INSEE

### Nombre de menages
- `C22_MEN`, `C16_MEN`, `C11_MEN` - Nombre total de menages

### Structure des menages
- `MENPSEUL` / `MENHSEUL` / `MENFSEUL` - Personnes seules (total, hommes, femmes)
- `MENSFAM` - Autres sans famille
- `MENFAM` - Menages avec famille(s)
- `MENCOUPSENF` - Couples sans enfant
- `MENCOUPAENF` - Couples avec enfant(s)
- `MENFAMMONO` - Familles monoparentales

### Population des menages
- `PMEN` et declinaisons par type de menage

### Familles
- `FAM`, `COUPAENF`, `FAMMONO`, `HMONO`, `FMONO`, `COUPSENF`
- `NE24F0` a `NE24F4P` - Nombre d'enfants de moins de 25 ans par famille

### Familles traditionnelles vs recomposees (2022 uniquement)
- `C22_FAMTRAD` - Couples avec uniquement enfants du couple
- `C22_FAMRECOMP` - Couples avec enfant d'un seul membre

### Mode de cohabitation (par age)
- `PSEUL` - Vivant seul (par tranche 15-19 a 80+)
- `COUPLE` - Vivant en couple (par tranche 15-19 a 80+)

### Statut matrimonial
- 2022 : `MARIEE`, `PACSEE`, `CONCUB_UNION_LIBRE`, `VEUFS`, `DIVORCEE`, `CELIBATAIRE`
- 2016 : `MARIEE`, `NONMARIEE`
- 2011 : `MARIE`, `CELIB`, `VEUF`, `DIVOR`

### CSP de la personne de reference du menage
- `MEN_STAT_GSEC11_21` a `MEN_STAT_GSEC40` (agri, artisan, cadre, intermed, employe, ouvrier, retraite, autre)

## Croisements possibles

### 2.1 Croissance des menages vs consommation
- **Indicateur** : Delta nb menages vs consommation cumulee
- **Question** : La creation de menages est-elle un meilleur predicteur de consommation que la croissance demo ?
- **Ratio derive** : Consommation par nouveau menage (ha / menage gagne)

### 2.2 Desserrement des menages vs consommation
- **Indicateur** : Evolution du ratio population/menages (taille moyenne des menages) vs consommation
- **Question** : Le desserrement (plus de menages pour la meme population) genere-t-il de la consommation ?

### 2.3 Part des personnes seules vs consommation
- **Indicateur** : Evolution de la part MENPSEUL / MEN vs consommation
- **Question** : L'augmentation des menages d'une personne pousse-t-elle la consommation d'espace ?

### 2.4 Familles avec enfants vs consommation
- **Indicateur** : Evolution MENCOUPAENF vs consommation
- **Question** : L'accueil de familles avec enfants est-il correle a plus de consommation (maisons individuelles) ?

### 2.5 CSP du chef de menage vs consommation
- **Indicateur** : Part des menages ouvriers, cadres, retraites vs consommation/menage
- **Question** : Le profil socioprofessionnel influence-t-il l'intensite de la consommation ?
