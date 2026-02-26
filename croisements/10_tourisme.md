# Croisement 10 : Tourisme x Consommation

## Variables INSEE (snapshot 2026)

### Hotels
- `HT25` - Total hotels
- `HT025` a `HT525` - Par classement (0 a 5 etoiles)
- `HTCH25` - Total chambres
- `HTCH025` a `HTCH525` - Chambres par classement

### Campings
- `CPG25` - Total campings
- `CPG025` a `CPG525` - Par classement
- `CPGE25` - Total emplacements
- `CPGEL25` - Emplacements loues a l'annee
- `CPGEO25` - Emplacements clientele de passage

### Autres hebergements touristiques
- `VV25`, `VVUH25`, `VVLIT25` - Villages vacances
- `RT25`, `RTUH25`, `RTLIT25` - Residences de tourisme
- `AJCS25`, `AJCSUH25`, `AJCSLIT25` - Auberges de jeunesse

## Croisements possibles

### 10.1 Capacite touristique vs consommation
- **Indicateur** : (HTCH25 + CPGE25 + VVLIT25 + RTLIT25) / population vs consommation
- **Question** : Les communes touristiques consomment-elles plus d'espace ?

### 10.2 Camping vs consommation
- **Indicateur** : Surface camping (proxy : nb emplacements) vs consommation
- **Question** : L'hotellerie de plein air est-elle un facteur de consommation specifique ?

### 10.3 Residences de tourisme vs consommation
- **Indicateur** : Nombre d'UH residences de tourisme vs consommation
- **Question** : Les residences de tourisme (souvent neuves) participent-elles a la consommation ?

## Note
Donnees 2026, pas de comparaison temporelle possible. Croisement en coupe transversale uniquement.
A coupler avec le taux de residences secondaires (RSECOCC du recensement) pour une vue complete du poids touristique.
