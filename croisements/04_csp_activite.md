# Croisement 4 : Categories socioprofessionnelles et activite x Consommation

## Variables INSEE

### CSP de la population 15+ (complementaire)
- `POP15P_STAT_GSEC11_21` a `POP15P_STAT_GSEC40` : Agriculteurs, Artisans/Commercants/Chefs d'entreprise, Cadres, Professions intermediaires, Employes, Ouvriers, Retraites, Autres inactifs
- Declinaisons par sexe (H15P, F15P) et tranche d'age (1524, 2554, 55P)

### Activite / emploi (population 15+)
- `ACTOCC15P` - Actifs occupes 15+
- `SAL15P` / `NSAL15P` - Salaries / Non-salaries
- `ACTOCC15P_TP` - Actifs a temps partiel

### Type de contrat (par sexe)
- `SAL15P_CDI` - Fonction publique / CDI
- `SAL15P_CDD` - CDD
- `SAL15P_INTERIM` - Interim
- `SAL15P_EMPAID` - Emplois aides
- `SAL15P_APPR` - Apprentissage / Stage

### Non-salaries (par sexe)
- `NSAL15P_INDEP` - Independants
- `NSAL15P_EMPLOY` - Employeurs
- `NSAL15P_AIDFAM` - Aides familiaux

### Activite/chomage 15-64 ans
- `ACT1564` - Actifs 15-64
- `ACTOCC1564` - Actifs occupes 15-64
- `CHOM1564` - Chomeurs 15-64
- `INACT1564` - Inactifs 15-64
- `ETUD1564` - Etudiants/stagiaires
- `RETR1564` - Retraites/preretraites 15-64
- Declinaisons par tranche (1524, 2554, 5564) et sexe

### Chomage par diplome (2022 uniquement)
- `CHOM_DIPLMIN` a `CHOM_SUP5`

### Actifs par CSP (complementaire 15-64)
- `ACT1564_STAT_GSEC11_21` a `ACT1564_STAT_GSEC16_26`
- `ACTOCC1564_STAT_GSEC11` a `ACTOCC1564_STAT_GSEC16`

## Croisements possibles

### 4.1 Taux d'emploi vs consommation
- **Indicateur** : Taux d'emploi (ACTOCC1564/POP1564) vs consommation
- **Question** : Les communes dynamiques economiquement consomment-elles plus ?

### 4.2 Chomage vs consommation
- **Indicateur** : Taux de chomage (CHOM1564/ACT1564) vs consommation
- **Question** : Les communes a fort chomage consomment-elles quand meme des espaces ?

### 4.3 Profil CSP vs consommation
- **Indicateur** : Part cadres, ouvriers, agriculteurs vs consommation/hab
- **Question** : Le profil socioprofessionnel d'une commune influence-t-il son modele d'urbanisation ?

### 4.4 Part agriculteurs vs consommation
- **Indicateur** : Evolution part agriculteurs (GSEC11_21/POP15P) vs consommation agricole
- **Question** : La perte d'agriculteurs est-elle correlee a la consommation de terres agricoles ?

### 4.5 Precarite de l'emploi vs consommation
- **Indicateur** : Part CDD+interim+emplois aides vs consommation
- **Question** : Les communes avec emploi precaire ont-elles un profil de consommation different ?
