# Croisement 3 : Logement x Consommation

## Variables INSEE

### Stock de logements
- `LOG` - Total logements
- `RP` - Residences principales
- `RSECOCC` - Residences secondaires et logements occasionnels
- `LOGVAC` - Logements vacants

### Type de logement
- `MAISON` / `APPART` - Maisons / Appartements
- `RPMAISON` / `RPAPPART` - Residences principales maison / appartement

### Taille des logements
- `RP_1P` a `RP_5PP` - Nombre de pieces (1 a 5+)
- `NBPI_RP` - Nombre total de pieces des residences principales
- `NBPI_RPMAISON` / `NBPI_RPAPPART` - Pieces par type

### Occupation / Suroccupation (2022, 2016, 2011)
- `RP_NORME` - Occupation dans la norme
- `RP_SOUSOCC_MOD`, `RP_SOUSOCC_ACC`, `RP_SOUSOCC_TACC` - Sous-occupation (moderee, accentuee, tres accentuee)
- `RP_SUROCC_MOD`, `RP_SUROCC_ACC` - Suroccupation (moderee, accentuee)

### Anciennete de construction
- 2022 : `RP_ACH1919` a `RP_ACH2019` (7 periodes)
- 2016 : `RP_ACH19` a `RP_ACH13` (7 periodes)
- 2011 : `RP_ACHT1` a `RP_ACHT3` (3 periodes)

### Anciennete d'emmenagement
- `MEN_ANEM0002`, `MEN_ANEM0204`, `MEN_ANEM0509`, `MEN_ANEM10P`, `MEN_ANEM1019`, `MEN_ANEM2029`, `MEN_ANEM30P`

### Statut d'occupation
- `RP_PROP` - Proprietaires
- `RP_LOC` - Locataires
- `RP_LOCHLMV` - HLM loue vide
- `RP_GRAT` - Loge gratuitement

### Anciennete d'emmenagement
- `ANEM_RP` - Anciennete totale (en annees)
- Declinaisons par statut d'occupation

### Chauffage
- `RP_CGAZV`, `RP_CFIOUL`, `RP_CELEC`, `RP_CGAZB`, `RP_CAUT`

### Equipements du logement
- `RP_ELEC`, `RP_EAUCH`, `RP_BDWC`, `RP_CHOS`, `RP_CLIM`, `RP_TTEGOU`

### Stationnement et voitures
- `RP_GARL` - Au moins un parking
- `RP_VOIT1P` - Au moins une voiture
- `RP_VOIT1` - Une voiture
- `RP_VOIT2P` - Deux voitures ou plus

### Type de construction (DOM)
- `RP_HABFOR`, `RP_CASE`, `RP_MIBOIS`, `RP_MIDUR`

## Croisements possibles

### 3.1 Construction neuve vs consommation
- **Indicateur** : Delta logements (LOG P22-P16) vs consommation cumulee
- **Question** : Quelle est la consommation d'espace par logement neuf ?
- **Ratio derive** : ha consommes / logement cree

### 3.2 Part maisons vs consommation
- **Indicateur** : Part MAISON/LOG vs consommation/logement
- **Question** : Les communes a dominante pavillonnaire consomment-elles plus par logement ?

### 3.3 Vacance vs consommation
- **Indicateur** : Taux de vacance (LOGVAC/LOG) vs consommation
- **Question** : Les communes a forte vacance continuent-elles a consommer des espaces NAF ?
- **Alerte** : Identifier les communes qui consomment ET ont de la vacance croissante

### 3.4 Residences secondaires vs consommation
- **Indicateur** : Part RSECOCC/LOG vs consommation
- **Question** : Le tourisme residentiel est-il un moteur de consommation ?

### 3.5 Sous-occupation vs consommation
- **Indicateur** : Part sous-occupation (SOUSOCC_ACC + SOUSOCC_TACC) vs consommation
- **Question** : Y a-t-il un lien entre sous-occupation du parc et besoin de construire ?

### 3.6 Proprietaires vs consommation
- **Indicateur** : Evolution du taux de proprietaires (PROP/RP) vs consommation
- **Question** : L'accession a la propriete motive-t-elle la consommation d'espace ?

### 3.7 HLM vs consommation
- **Indicateur** : Part HLM (LOCHLMV/RP) vs consommation
- **Question** : La construction sociale contribue-t-elle a la consommation d'espace ?

### 3.8 Taille des logements vs consommation
- **Indicateur** : Nombre moyen de pieces (NBPI_RP/RP) vs consommation
- **Question** : Les communes ou les logements sont plus grands consomment-elles plus ?

### 3.9 Motorisation vs consommation
- **Indicateur** : Part multi-voitures (VOIT2P/MEN) vs consommation
- **Question** : La dependance automobile est-elle correlee a l'etalement urbain ?
