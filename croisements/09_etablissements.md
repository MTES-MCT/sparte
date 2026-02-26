# Croisement 9 : Etablissements economiques x Consommation

## Variables INSEE (SIRENE)

### Stock d'etablissements fin 2023
- `ETTOT23` - Total
- Par secteur : `ETAZ23` (agriculture), `ETBE23` (industrie), `ETFZ23` (construction), `ETGU23` (commerce/services), `ETOQ23` (services non marchands)
- Par taille : 0 salarie, 1-9, 10-19, 20-49, 50-99, 100+ (declinaisons par secteur)

### Creations d'etablissements (annuelles, 2014 a 2023)
- `ETCTOT14` a `ETCTOT23` - Total creations par annee
- Par secteur NAF : industrie (BE), construction (FZ), commerce/transport/hebergement (GI), info-comm (JZ), finance (KZ), immobilier (LZ), activites specialisees (MN), admin/enseignement/sante (OQ), autres services (RU)

## Croisements possibles

### 9.1 Dynamique d'etablissements vs consommation
- **Indicateur** : Creations d'etablissements (ETCTOT annuel) vs consommation annuelle
- **Question** : La creation d'entreprises est-elle un moteur de consommation d'espace ?
- **Avantage** : Creations annuelles => croisement direct avec flux conso annuels (pas d'interpolation)

### 9.2 Creations immobilieres vs consommation
- **Indicateur** : Creations d'etablissements immobiliers (ETCLZ) vs consommation
- **Question** : L'activite immobiliere precede-t-elle la consommation d'espace ?

### 9.3 Densite economique vs consommation
- **Indicateur** : ETTOT23/surface vs consommation/surface
- **Question** : Les communes avec forte densite economique consomment-elles differemment ?

### 9.4 Taille des etablissements vs consommation
- **Indicateur** : Part des gros etablissements (50+ salaries) vs consommation
- **Question** : Les zones d'activites pour gros employeurs sont-elles plus consommatrices ?

### 9.5 Creations construction vs consommation
- **Indicateur** : ETCFZ (creations dans la construction) vs consommation
- **Question** : L'activite du BTP est-elle un indicateur avance de la consommation ?

## Note
Les creations d'etablissements (2014-2023) sont annuelles, ce qui permet un croisement direct et temporel avec les flux de consommation annuels. C'est un avantage par rapport aux donnees de recensement.
