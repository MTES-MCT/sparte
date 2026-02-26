# Croisement 1 : Population et demographie x Consommation

## Variables INSEE

### Population totale
- `P22_POP`, `P16_POP`, `P11_POP` - Population totale

### Tranches d'age (7 tranches)
- `POP0014`, `POP1529`, `POP3044`, `POP4559`, `POP6074`, `POP7589`, `POP90P`

### Genre
- `POPH` / `POPF` - Hommes / Femmes (total + par tranche d'age)

### Tranches age fines (scolarisation)
- `POP0205`, `POP0610`, `POP1114`, `POP1517`, `POP1824`, `POP2529`, `POP30P`

## Croisements possibles

### 1.1 Croissance demographique vs consommation
- **Indicateur** : Delta population (P22-P16, P16-P11) vs consommation cumulee NAF sur la meme periode
- **Question** : Les communes qui consomment le plus d'espaces sont-elles celles qui croissent le plus ?
- **Ratio derive** : Consommation par nouvel habitant (ha / habitant gagne)

### 1.2 Vieillissement vs consommation
- **Indicateur** : Evolution de la part des 60+ (ou 75+) vs consommation
- **Question** : Les communes vieillissantes consomment-elles autant d'espace que les communes jeunes ?
- **Ratio derive** : Part des 60+ vs consommation/habitant

### 1.3 Densite de population vs consommation
- **Indicateur** : Population / surface communale vs consommation/ha
- **Question** : Quelle est la relation entre densite et intensite de consommation ?

### 1.4 Structure d'age vs consommation
- **Indicateur** : Variation de la pop 25-54 (actifs) vs consommation
- **Question** : L'arrivee d'actifs est-elle le moteur principal de la consommation ?

## Periodes de croisement
| Periode recensement | Flux conso a sommer |
|---|---|
| 2010 -> 2015 (P11 -> P16) | Annees 2011 a 2015 |
| 2015 -> 2022 (P16 -> P22) | Annees 2016 a 2022 |
| 2010 -> 2022 (P11 -> P22) | Annees 2011 a 2022 |
