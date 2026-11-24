// Couleurs de la carte des sols. L'IGN ne publie son image de l'OCS GE que dans un style : un rouge
// et un vert translucides, de même clarté. Chaque tuile est donc recolorée dans le navigateur, au
// rouge de l'artificialisation des diagnostics sur un vert très pâle : les deux couleurs diffèrent
// par leur clarté autant que par leur teinte, et se distinguent en vision daltonienne (écart de 26
// en deutéranopie, contre 14 pour les couleurs de l'IGN ; échelle OKLab × 100).
import { ARTIFICIALISATION_COLOR } from '@components/map/constants/config';

export const SOIL_ARTIFICIAL_COLOR = ARTIFICIALISATION_COLOR.toLowerCase();
export const SOIL_NATURAL_COLOR = '#dcebd2';

// Protocole des adresses dont les images sont recolorées (voir soilImageProtocol)
export const SOIL_IMAGE_PROTOCOL = 'ign-artif';

// Adresse de la même image par le protocole de recoloration, et son adresse réelle
export const recoloredUrl = (url: string): string => url.replace(/^https:/, `${SOIL_IMAGE_PROTOCOL}:`);
export const sourceUrl = (url: string): string => url.replace(new RegExp(`^${SOIL_IMAGE_PROTOCOL}:`), 'https:');

type Rgb = [number, number, number];
const rgbOf = (hex: string): Rgb => [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16)) as Rgb;

// Couleurs de l'image publiée : sol artificialisé rgb(255, 145, 145), sol non artificialisé
// rgb(165, 255, 128), tous deux à demi transparents (relevé sur des tuiles de la génération
// 2021-2023). L'écart entre le rouge et le vert d'un pixel va de -90 (non artificialisé) à +110
// (artificialisé).
const NATURAL_RED_MINUS_GREEN = -90;
const ARTIFICIAL_RED_MINUS_GREEN = 110;

// Part artificialisée que code un pixel de l'image, de 0 à 1. Aux vues larges, un pixel moyenne
// plusieurs objets : sa couleur est un mélange des deux, et sa part est intermédiaire.
export const artificialShare = (red: number, green: number): number =>
    Math.min(1, Math.max(0, (red - green - NATURAL_RED_MINUS_GREEN) / (ARTIFICIAL_RED_MINUS_GREEN - NATURAL_RED_MINUS_GREEN)));

// Recolore sur place les pixels RGBA d'une image de l'IGN. Un pixel prend la couleur de sa part
// artificialisée, entre le vert pâle et le rouge, et devient opaque ; un pixel transparent (pas de
// donnée OCS GE) le reste, et laisse voir le motif du fond.
export const recolorSoilPixels = (data: Uint8ClampedArray, artificial: string = SOIL_ARTIFICIAL_COLOR, natural: string = SOIL_NATURAL_COLOR): void => {
    const to = rgbOf(artificial);
    const from = rgbOf(natural);
    for (let offset = 0; offset < data.length; offset += 4) {
        const alpha = data[offset + 3];
        if (alpha === 0) continue;
        const share = artificialShare(data[offset], data[offset + 1]);
        data[offset] = Math.round(from[0] + (to[0] - from[0]) * share);
        data[offset + 1] = Math.round(from[1] + (to[1] - from[1]) * share);
        data[offset + 2] = Math.round(from[2] + (to[2] - from[2]) * share);
        // L'image est à demi transparente : deux fois son opacité la rend pleine, et garde le fondu de ses bords
        data[offset + 3] = Math.min(255, alpha * 2);
    }
};

type Surface = { canvas: OffscreenCanvas | HTMLCanvasElement; context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D };

const surfaceOf = (width: number, height: number): Surface => {
    if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(width, height);
        return { canvas, context: canvas.getContext('2d', { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D };
    }
    const canvas = Object.assign(document.createElement('canvas'), { width, height });
    return { canvas, context: canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D };
};

// Erreur de réponse, avec son statut : la carte distingue une tuile absente (404) d'une panne
class SoilImageError extends Error {
    constructor(
        readonly status: number,
        url: string,
    ) {
        super(`Image de l'OCS GE : réponse ${status} pour ${url}`);
    }
}

// Protocole MapLibre : charge l'image à son adresse réelle, la recolore et la rend décodée. Il
// sert les tuiles de l'image comme les images des cartouches d'outre-mer.
export const soilImageProtocol = async ({ url }: { url: string }, abortController: AbortController): Promise<{ data: ImageBitmap }> => {
    const address = sourceUrl(url);
    const response = await fetch(address, { signal: abortController.signal });
    if (!response.ok) throw new SoilImageError(response.status, address);
    const bitmap = await createImageBitmap(await response.blob());
    const { canvas, context } = surfaceOf(bitmap.width, bitmap.height);
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    recolorSoilPixels(pixels.data);
    context.putImageData(pixels, 0, 0);
    return { data: await createImageBitmap(canvas) };
};
