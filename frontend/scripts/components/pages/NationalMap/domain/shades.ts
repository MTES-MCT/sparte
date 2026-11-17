// Nuances d'une couleur : la même teinte, éclaircie vers le blanc ou assombrie vers le noir, à une
// clarté donnée. Sert aux dégradés d'une grandeur croissante construits sur une couleur imposée :
// des classes de même clarté d'une couleur à l'autre se lisent de la même façon.
//
// La clarté est celle d'OKLab (L, ici de 0 à 100) : à écart égal, deux nuances paraissent aussi
// éloignées l'une de l'autre, ce qui n'est pas vrai des composantes rouge, verte et bleue.

type Rgb = [number, number, number];

const CHANNEL_MAX = 255;

const parseHex = (hex: string): Rgb => [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16)) as Rgb;

const toHex = (rgb: Rgb): string => `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;

// Composante sRGB (0 à 255) en intensité lumineuse (0 à 1)
const toLinear = (channel: number): number => {
    const share = channel / CHANNEL_MAX;
    return share <= 0.04045 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
};

const lightnessOfRgb = (rgb: Rgb): number => {
    const [red, green, blue] = rgb.map(toLinear);
    const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
    const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
    const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
    return 100 * (0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short);
};

// Clarté d'une couleur `#rrggbb`, de 0 (noir) à 100 (blanc)
export const lightnessOf = (hex: string): number => lightnessOfRgb(parseHex(hex));

// Position sur le chemin blanc → couleur → noir : 0 le blanc, 1 la couleur, 2 le noir. Ce sont les
// deux opérations du carroyage de la page Consommation : un mélange avec le blanc pour éclaircir,
// une réduction des trois composantes pour assombrir.
const WHITE_POSITION = 0;
const COLOR_POSITION = 1;
const BLACK_POSITION = 2;

const shadeAt = (rgb: Rgb, position: number): Rgb =>
    (position <= COLOR_POSITION
        ? rgb.map((channel) => CHANNEL_MAX + (channel - CHANNEL_MAX) * position)
        : rgb.map((channel) => channel * (BLACK_POSITION - position))) as Rgb;

// La clarté décroît le long du chemin : vingt-quatre dichotomies la situent bien en deçà d'un
// niveau de composante
const SEARCH_STEPS = 24;

// Nuance de `hex` dont la clarté est `lightness` (0 à 100)
export const shadeOfLightness = (hex: string, lightness: number): string => {
    const rgb = parseHex(hex);
    let lighter = WHITE_POSITION;
    let darker = BLACK_POSITION;
    for (let step = 0; step < SEARCH_STEPS; step += 1) {
        const middle = (lighter + darker) / 2;
        if (lightnessOfRgb(shadeAt(rgb, middle)) > lightness) lighter = middle;
        else darker = middle;
    }
    return toHex(shadeAt(rgb, (lighter + darker) / 2));
};
