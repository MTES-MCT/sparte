// Territoire sans donnée : des hachures grises sur fond blanc, les mêmes sur toutes les cartes, dans
// leurs légendes et dans l'image exportée. Un motif se lit sans dépendre d'une couleur : il ne se
// confond avec aucune classe, même en vision daltonienne ou sur une impression en noir et blanc.
import { NO_DATA_COLOR } from '../values';

// Pas du motif, en pixels d'écran, et épaisseur de ses traits
export const NO_DATA_HATCH_STEP_PX = 6;
const HATCH_WIDTH_PX = 1.5;
export const NO_DATA_HATCH_COLOR = '#9c9c9c';
export const NO_DATA_HATCH_BACKGROUND = '#ffffff';

// Nom de l'image du motif dans le style MapLibre
export const NO_DATA_PATTERN_ID = 'national-map-no-data';

// Fond CSS d'une pastille de légende : les traits montent vers la droite, comme sur les cartes
export const NO_DATA_CSS_BACKGROUND = `repeating-linear-gradient(135deg, ${NO_DATA_HATCH_BACKGROUND} 0 ${NO_DATA_HATCH_STEP_PX - HATCH_WIDTH_PX}px, ${NO_DATA_HATCH_COLOR} ${NO_DATA_HATCH_STEP_PX - HATCH_WIDTH_PX}px ${NO_DATA_HATCH_STEP_PX}px)`;

// Fond d'une pastille de légende d'après sa couleur : le motif pour celle du « sans donnée »
export const swatchBackground = (color: string): string => (color === NO_DATA_COLOR ? NO_DATA_CSS_BACKGROUND : color);

const channelsOf = (hex: string): [number, number, number] => [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16)) as [number, number, number];

// Carreau du motif, en pixels RGBA, pour MapLibre (`map.addImage`) : il se répète sans raccord,
// horizontalement comme verticalement. `pixelRatio` : densité de l'image (2 sur un écran Retina).
export const noDataPatternImage = (pixelRatio = 2): { width: number; height: number; data: Uint8ClampedArray } => {
    const size = NO_DATA_HATCH_STEP_PX * pixelRatio;
    const data = new Uint8ClampedArray(size * size * 4);
    const stroke = channelsOf(NO_DATA_HATCH_COLOR);
    const background = channelsOf(NO_DATA_HATCH_BACKGROUND);
    const strokeWidth = HATCH_WIDTH_PX * pixelRatio * Math.SQRT2;
    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            // Un trait suit x + y constant : il monte vers la droite
            const [r, g, b] = (x + y) % size < strokeWidth ? stroke : background;
            data.set([r, g, b, 255], (y * size + x) * 4);
        }
    }
    return { width: size, height: size, data };
};

// Le même motif pour Highcharts (module pattern-fill) : un trait sur la diagonale du carreau, et
// ses deux raccords dans les coins
export const NO_DATA_HIGHCHARTS_PATTERN = {
    pattern: {
        path: {
            d: `M 0 ${NO_DATA_HATCH_STEP_PX} L ${NO_DATA_HATCH_STEP_PX} 0 M -1 1 L 1 -1 M ${NO_DATA_HATCH_STEP_PX - 1} ${NO_DATA_HATCH_STEP_PX + 1} L ${NO_DATA_HATCH_STEP_PX + 1} ${NO_DATA_HATCH_STEP_PX - 1}`,
            stroke: NO_DATA_HATCH_COLOR,
            strokeWidth: HATCH_WIDTH_PX,
        },
        width: NO_DATA_HATCH_STEP_PX,
        height: NO_DATA_HATCH_STEP_PX,
        backgroundColor: NO_DATA_HATCH_BACKGROUND,
    },
};
