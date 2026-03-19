# Croisement 5 : Mobilite et deplacements x Consommation

## Variables INSEE

### Mobilite residentielle (pop 1 an ou plus)
- `POP01P` - Population localisee 1 an auparavant
- `POP01P_IRAN1` - Meme logement
- `POP01P_IRAN2` - Autre logement, meme commune
- `POP01P_IRAN3` - Autre commune, meme departement
- `POP01P_IRAN4` - Autre departement, meme region
- `POP01P_IRAN5` - Autre region metropole
- `POP01P_IRAN6` - Depuis un DOM
- `POP01P_IRAN7` - Depuis hors metro/DOM
- Declinaisons par tranche d'age (0114, 1524, 2554, 55P)

### Lieu de travail
- `ACTOCC15P_ILT1` - Travaille dans la commune de residence
- `ACTOCC15P_ILT2P` - Travaille dans une autre commune
- `ACTOCC15P_ILT2` - Autre commune, meme departement
- `ACTOCC15P_ILT3` - Autre departement, meme region
- `ACTOCC15P_ILT4` - Autre region en metropole
- `ACTOCC15P_ILT5` - Hors metropole

### Mode de transport domicile-travail
- `ACTOCC15P_PASTRANS` - Pas de transport
- `ACTOCC15P_MARCHE` - Marche a pied
- `ACTOCC15P_VELO` - Velo (2022 uniquement)
- `ACTOCC15P_2ROUESMOT` - Deux-roues motorise (2022) / `2ROUES` (2016/2011)
- `ACTOCC15P_VOITURE` - Voiture
- `ACTOCC15P_COMMUN` - Transports en commun

## Croisements possibles

### 5.1 Mobilite residentielle entrante vs consommation
- **Indicateur** : Part des nouveaux arrivants (IRAN3+4+5+6+7 / POP01P) vs consommation
- **Question** : L'attractivite residentielle (arrivees d'ailleurs) est-elle un moteur de consommation ?

### 5.2 Mobilite intra-communale vs consommation
- **Indicateur** : Part IRAN2/POP01P vs consommation
- **Question** : Le renouvellement interne (demenagements au sein de la commune) est-il lie a de la construction neuve consommatrice ?

### 5.3 Navetteurs vs consommation
- **Indicateur** : Part des actifs travaillant hors commune (ILT2P/ACTOCC15P) vs consommation
- **Question** : Les communes-dortoirs (forte part de navetteurs) consomment-elles plus d'espace ?

### 5.4 Dependance voiture vs consommation
- **Indicateur** : Part voiture (VOITURE/ACTOCC15P) vs consommation/hab
- **Question** : La dependance a la voiture est-elle un proxy de l'etalement urbain ?

### 5.5 Evolution des modes de transport vs consommation
- **Indicateur** : Delta part voiture (P22-P16) vs delta consommation
- **Question** : La transition modale est-elle correlee a une reduction de la consommation ?

### 5.6 Mobilite des jeunes actifs vs consommation
- **Indicateur** : Flux entrants 25-54 ans (POP2554_IRAN3P) vs consommation
- **Question** : L'arrivee de jeunes actifs genere-t-elle plus de consommation que celle des retraites ?
