// Ce qu'une carte dit de l'élément désigné (territoire, commune, carreau, cercle, anneau, objet
// OCS GE), dans une seule grammaire : son nom en titre, sa valeur mise en avant avec son unité,
// une ligne de contexte au plus. Toutes les cartes écrivent déjà cette lecture en une phrase
// (`valueText`), que la légende, les tableaux de données et les lecteurs d'écran reprennent telle
// quelle : elle est découpée ici, une fois, pour l'infobulle des deux moteurs et pour la fiche des
// écrans tactiles. Une phrase qui ne suit aucune des formes connues n'est jamais tronquée : elle
// passe entière en contexte.

// Une mesure de l'élément ; `label` vide quand la carte n'en montre qu'une
export type TipMeasure = { label: string; value: string };

export type MapTip = {
    title: string;
    // Couleur de la classe de l'élément dans la légende ; null : aucune pastille
    swatch: string | null;
    // Aucune pour un élément sans valeur, deux pour une carte qui croise deux taux
    measures: TipMeasure[];
    // Ce qui situe la valeur : période, millésimes, moyenne annuelle, maille de la mesure
    context: string;
};

export type TipSource = {
    name: string;
    // Phrase de la carte ; ses lignes sont séparées par `<br/>`
    valueText: string;
    swatch?: string | null;
};

const LINE_BREAK = /<br\s*\/?>/;
// « Évolution du nombre de ménages : 0,42 % par an »
const LABELLED = /^(.+?) : (.+)$/;
// Une valeur commence par un nombre, signé ou non
const QUANTITY = /^[+−-]?\d/;
// Faits d'un objet OCS GE : « Couverture : zones bâties · usage : résidentiel · 1 240 m² · millésime 2020 »
const FACTS_SEPARATOR = ' · ';
// Où la valeur s'arrête dans une phrase : à sa moyenne (« , soit », « , en moyenne »), à une
// précision entre parenthèses, au lieu de la mesure (« dans ce carreau »), à sa période
// (« de 2011 à 2024 », « en 2020 », « entre 2018 et 2021 ») ou à ses millésimes de l'OCS GE
// (« au millésime n°2 (2020) », « entre le millésime n°1 (2017) et le millésime n°2 (2020) »,
// voir domain/millesimes.ts)
// Ce qui ouvre le contexte après une virgule, puis après un simple blanc. Motifs « collants » :
// ils ne sont essayés qu'à la position donnée (voir opensAt).
const AFTER_COMMA = /soit |en moyenne /y;
const AFTER_BLANK = [/\(/y, /dans ce /y, /(?:de|en|entre) \d{4}\b/y, /au (?:dernier )?millésime\b/y, /entre (?:le|les deux derniers) millésimes?\b/y];
const BLANKS = /\s+/g;

const opensAt = (pattern: RegExp, text: string, index: number): boolean => {
    pattern.lastIndex = index;
    return pattern.test(text);
};

// Où finit la valeur et où commence le contexte : au premier blanc suivi d'une ouverture de
// contexte ; la virgule qui précède « soit » ou « en moyenne » part avec le blanc
const contextBoundary = (sentence: string): { valueEnd: number; contextStart: number } | null => {
    for (const blank of sentence.matchAll(BLANKS)) {
        const start = blank.index ?? 0;
        const end = start + blank[0].length;
        if (sentence[start - 1] === ',' && opensAt(AFTER_COMMA, sentence, end)) return { valueEnd: start - 1, contextStart: end };
        if (AFTER_BLANK.some((pattern) => opensAt(pattern, sentence, end))) return { valueEnd: start, contextStart: end };
    }
    return null;
};

const isQuantity = (text: string): boolean => QUANTITY.test(text);

// « (millésime 2021) » s'écrit sans ses parenthèses quand il est seul sur sa ligne
const unwrapped = (text: string): string => text.replace(/^\(([^()]*)\)$/, '$1');

const joined = (parts: string[], separator: string): string => parts.filter(Boolean).join(separator);

// Valeur et contexte d'une phrase ; sans nombre en tête, elle n'a pas de valeur à mettre en avant
const splitSentence = (sentence: string): { value: string; context: string } => {
    if (!isQuantity(sentence)) return { value: '', context: sentence };
    const boundary = contextBoundary(sentence);
    if (!boundary) return { value: sentence, context: '' };
    return { value: sentence.slice(0, boundary.valueEnd), context: unwrapped(sentence.slice(boundary.contextStart)) };
};

export const tipOf = ({ name, valueText, swatch = null }: TipSource): MapTip => {
    const tip = { title: name, swatch };
    const lines = valueText
        .split(LINE_BREAK)
        .map((line) => line.trim())
        .filter(Boolean);
    const [head = '', ...rest] = lines;

    // Plusieurs mesures nommées (carte bivariée) : chacune garde son libellé
    const labelled = lines.map((line) => LABELLED.exec(line));
    if (lines.length > 1 && labelled.every((match) => match && isQuantity(match[2]))) {
        return { ...tip, measures: labelled.map(([, label, value]) => ({ label, value })), context: '' };
    }

    // Liste de faits (objet OCS GE) : le fait chiffré, sa surface, est la valeur
    if (head.includes(FACTS_SEPARATOR)) {
        const facts = head.split(FACTS_SEPARATOR);
        const quantity = facts.find(isQuantity);
        return {
            ...tip,
            measures: quantity ? [{ label: '', value: quantity }] : [],
            context: joined([...facts.filter((fact) => fact !== quantity), ...rest], FACTS_SEPARATOR),
        };
    }

    // Une seule mesure nommée (« Maille de 1 km × 1 km : 23 % de sols artificialisés ») : son
    // libellé dit sur quoi elle porte, il rejoint le contexte
    const [, label, sentence] = LABELLED.exec(head) ?? [];
    const named = label !== undefined && isQuantity(sentence);
    const { value, context } = splitSentence(named ? sentence : head);
    return {
        ...tip,
        measures: value ? [{ label: '', value }] : [],
        context: joined([named ? label : '', context, ...rest], ', '),
    };
};

// Ce que fait un appui ou un clic sur un élément de la carte
export type PressOutcome = 'read' | 'open' | 'none';

// Règle unique de toutes les cartes. Au doigt, il n'y a pas de survol : le premier appui lit
// toujours (la fiche s'ouvre), et seul le bouton de la fiche ouvre le territoire. À la souris ou
// au clavier, le survol a déjà lu : le clic ouvre le territoire quand il peut l'être.
export const pressOutcome = (touch: boolean, openable: boolean): PressOutcome => {
    if (touch) return 'read';
    return openable ? 'open' : 'none';
};
