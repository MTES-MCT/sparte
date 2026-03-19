# Croisement 7 : Emploi au lieu de travail x Consommation

## Variables INSEE

### Emplois au lieu de travail
- `EMPLT` - Total emplois au lieu de travail
- `EMPLT_SAL` / `EMPLT_NSAL` - Salaries / Non-salaries
- `EMPLT_FSAL` / `EMPLT_FNSAL` - Emplois salaries/non-salaries femmes
- `EMPLT_SALTP` / `EMPLT_NSALTP` - Emplois a temps partiel

### Emplois par secteur (lieu de travail)
- `EMPLT_AGRI` - Agriculture
- `EMPLT_INDUS` - Industrie
- `EMPLT_CONST` - Construction
- `EMPLT_CTS` - Commerce, Transports, Services divers
- `EMPLT_APESAS` - Administration publique, Enseignement, Sante, Action sociale

### Emplois par CSP (lieu de travail)
- `EMPLT_GS1` a `EMPLT_GS6` - Agriculteurs, Artisans, Cadres, Prof interm, Employes, Ouvriers

### Actifs occupes et actifs 15+
- `ACTOCC` - Actifs occupes (residence)
- `ACT15P` - Actifs 15+ (residence)

## Croisements possibles

### 7.1 Dynamique d'emploi vs consommation
- **Indicateur** : Delta emplois au LT (EMPLT P22-P16) vs consommation cumulee
- **Question** : La creation d'emplois sur place motive-t-elle la consommation d'espace (zones d'activites, logements) ?

### 7.2 Ratio emplois/actifs vs consommation
- **Indicateur** : EMPLT/ACTOCC (indicateur de concentration d'emploi) vs consommation
- **Question** : Les poles d'emploi (ratio > 1) consomment-ils differemment des communes-dortoirs (ratio < 1) ?

### 7.3 Secteur d'emploi vs consommation
- **Indicateur** : Part emploi agriculture, industrie, construction vs consommation
- **Question** : La specialisation economique influence-t-elle le type de consommation ?
- **Interet particulier** : Part EMPLT_CONST (construction) vs consommation = la filiere BTP genere-t-elle un cercle autoentretenu ?

### 7.4 Perte d'emploi agricole vs consommation agricole
- **Indicateur** : Delta EMPLT_AGRI vs consommation d'espaces agricoles
- **Question** : La disparition d'emplois agricoles precede-t-elle la consommation des terres ?
