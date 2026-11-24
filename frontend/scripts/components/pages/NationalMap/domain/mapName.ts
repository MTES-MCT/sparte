// Nom de la carte dessinée pour une carte du menu, une zone et une maille. Le menu, la légende,
// l'image exportée et les lecteurs d'écran le lisent tous ici : une vue ne dessine pas toujours la
// carte que nomme la ligne choisie. Sur la vue dense (voir viewProfile.ts), une carte en hectares
// laisse la place à sa version relative, puisque des hectares ne se lisent jamais en aplat ; la
// ligne du menu ne doit pas y laisser son titre en hectares au-dessus d'un aplat en pourcentage.
import type { Indicator } from '../indicators';
import { View, viewProfileOf } from './viewProfile';

export type MapName = {
    // Ce que la carte dessine : titre de la légende et de l'image exportée, libellé lu par les lecteurs d'écran
    label: string;
    // Quand la vue dessine autre chose que la carte que nomme la ligne du menu : pourquoi, et ce
    // qu'elle représente à la place. Une phrase sans point final, que la ligne du menu et la
    // méthode de la légende reprennent ; null quand la vue dessine la carte de la ligne.
    standIn: string | null;
};

// Symboles proportionnels d'une carte en hectares, et ce que la vue dense dit de la valeur qui les remplace
const SYMBOLS = { plural: 'cercles proportionnels', drawn: 'la valeur', amounts: 'les hectares' };
// Carte en anneaux : à la place de ses deux flux, la carte représente leur différence
const RINGS = { plural: 'anneaux', drawn: "l'artificialisation nette", amounts: 'ses hectares' };

const standInOf = (indicator: Indicator): string => {
    const { plural, drawn, amounts } = indicator.rings ? RINGS : SYMBOLS;
    return (
        `À l'échelle du pays, des ${plural} par commune ne seraient pas lisibles : la carte représente ${drawn} ` +
        `rapportée à la surface de chaque commune, et ${amounts} sont donnés au survol`
    );
};

export const mapNameOf = (view: View, indicator: Indicator): MapName => {
    const { drawn, amountKey } = viewProfileOf(view, indicator);
    // Les hectares ne sont donnés au survol que là où la carte dessine leur version relative
    return { label: drawn.label, standIn: amountKey === null ? null : standInOf(indicator) };
};
