// Image PNG d'une carte MapLibre : la carte telle qu'elle est à l'écran, avec son titre, son
// sous-titre, sa légende et ses crédits, composée dans un canevas puis téléchargée. Commune aux
// cartes de mailles et à la carte de toutes les communes du pays.
import type * as maplibregl from 'maplibre-gl';
import { showErrorToast } from '@components/ui/Toast';
import type { ExportLegend, MapImageInfo } from '../../domain/frame/exportImage';

const TEXT_COLOR = '#161616';
const MUTED_COLOR = '#666666';
const BACKGROUND_COLOR = '#ffffff';
// Mesures de l'image, en pixels de l'écran : elles sont multipliées par la densité du canevas de la carte
const PADDING = 24;
const HEADER_HEIGHT = 84;
const ROW_HEIGHT = 22;
const SWATCH = { width: 24, height: 14 };
// Case de la grille d'une carte bivariée, et place de ses deux lignes d'axe
const GRID_CELL = 18;
const GRID_AXES_HEIGHT = 2 * ROW_HEIGHT;

// Hauteur de la légende sous la carte, en pixels de l'écran
export const legendHeight = (legend: ExportLegend): number =>
    legend.kind === 'rows' ? legend.rows.length * ROW_HEIGHT : Math.max(legend.colors.length * GRID_CELL, GRID_AXES_HEIGHT) + ROW_HEIGHT / 2;

type Pen = { context: CanvasRenderingContext2D; px: (value: number) => number; font: (size: number, weight?: number) => string };

// Lignes « couleur, libellé », l'une sous l'autre ; rend l'ordonnée qui suit la dernière
const drawRows = ({ context, px, font }: Pen, rows: { color: string; name: string }[], left: number, top: number): number => {
    context.font = font(13);
    rows.forEach(({ color, name }, index) => {
        const y = top + px(ROW_HEIGHT) * index + px(ROW_HEIGHT) / 2;
        context.fillStyle = color;
        context.fillRect(left, y - px(SWATCH.height) / 2, px(SWATCH.width), px(SWATCH.height));
        // Un liseré : une classe très claire se détache du fond blanc
        context.strokeStyle = '#dddddd';
        context.lineWidth = 1;
        context.strokeRect(left, y - px(SWATCH.height) / 2, px(SWATCH.width), px(SWATCH.height));
        context.fillStyle = TEXT_COLOR;
        context.fillText(name, left + px(SWATCH.width + 10), y);
    });
    return top + px(ROW_HEIGHT) * rows.length;
};

// Grille d'une carte bivariée, et à sa droite le nom de ses axes : les lignes vers le bas, les
// colonnes vers la droite, des valeurs les plus faibles aux plus élevées
const drawGrid = ({ context, px, font }: Pen, legend: Extract<ExportLegend, { kind: 'grid' }>, left: number, top: number, maxWidth: number): number => {
    legend.colors.forEach((colors, row) =>
        colors.forEach((color, column) => {
            context.fillStyle = color;
            context.fillRect(left + px(GRID_CELL) * column, top + px(GRID_CELL) * row, px(GRID_CELL), px(GRID_CELL));
        }),
    );
    const textLeft = left + px(GRID_CELL) * Math.max(...legend.colors.map((colors) => colors.length)) + px(14);
    context.fillStyle = TEXT_COLOR;
    context.font = font(13);
    context.fillText(`↓ ${legend.rowsLabel}`, textLeft, top + px(ROW_HEIGHT) / 2, maxWidth - (textLeft - left));
    context.fillText(`→ ${legend.columnsLabel}`, textLeft, top + px(ROW_HEIGHT) * 1.5, maxWidth - (textLeft - left));
    return top + px(legendHeight(legend));
};

// Compose l'image et la télécharge. À appeler pendant le rendu d'une image de la carte : son
// tampon WebGL n'est lisible qu'à ce moment (voir exportMapPng).
export const downloadMapPng = (map: maplibregl.Map, info: MapImageInfo, legend: ExportLegend): void => {
    const source = map.getCanvas();
    const ratio = source.width / Math.max(source.clientWidth, 1);
    const px = (value: number) => Math.round(value * ratio);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D indisponible');
    const font = (size: number, weight = 400) => `${weight} ${px(size)}px Marianne, Arial, sans-serif`;
    const padding = px(PADDING);
    const header = px(HEADER_HEIGHT);
    canvas.width = source.width + padding * 2;
    canvas.height = header + source.height + px(ROW_HEIGHT / 2) + px(legendHeight(legend)) + px(ROW_HEIGHT) + padding;
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = TEXT_COLOR;
    context.textBaseline = 'middle';
    context.font = font(20, 600);
    context.fillText(info.title, padding, px(32), source.width);
    context.font = font(14);
    context.fillText(info.subtitle, padding, px(60), source.width);
    context.drawImage(source, padding, header);
    const legendTop = header + source.height + px(ROW_HEIGHT / 2);
    const pen = { context, px, font };
    const legendBottom = legend.kind === 'rows' ? drawRows(pen, legend.rows, padding, legendTop) : drawGrid(pen, legend, padding, legendTop, source.width);
    context.fillStyle = MUTED_COLOR;
    context.font = font(12);
    context.fillText(info.credits, padding, legendBottom + px(ROW_HEIGHT) / 2, source.width);
    const link = document.createElement('a');
    link.download = `${info.filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
};

// Télécharge l'image de la carte. `read` est lu au moment du rendu : l'image porte les textes et
// la légende de ce que la carte dessine à cet instant.
export const exportMapPng = (map: maplibregl.Map, read: () => { info: MapImageInfo; legend: ExportLegend }): void => {
    // Le tampon WebGL n'est lisible que pendant le rendu d'une image
    map.once('render', () => {
        try {
            const { info, legend } = read();
            downloadMapPng(map, info, legend);
        } catch {
            showErrorToast("Le téléchargement de l'image a échoué", 'Votre navigateur ne permet pas de générer cette carte en PNG.');
        }
    });
    map.triggerRepaint();
};
