import type * as maplibregl from 'maplibre-gl';
import { showErrorToast } from '@components/ui/Toast';
import type { ExportLegend, MapImageInfo } from '../../domain/frame/exportImage';
import { downloadMapPng, exportMapPng, legendHeight } from './exportPng';

jest.mock('@components/ui/Toast', () => ({ showErrorToast: jest.fn() }));

const INFO: MapImageInfo = { title: 'Titre de la carte', subtitle: 'France entière · par commune', filename: 'carte-france-comm', credits: 'Crédits' };
const ROWS: ExportLegend = {
    kind: 'rows',
    rows: [
        { color: '#111111', name: 'Classe basse' },
        { color: '#222222', name: 'Classe haute' },
    ],
};
const GRID: ExportLegend = {
    kind: 'grid',
    colors: [
        ['#a1', '#a2', '#a3'],
        ['#b1', '#b2', '#b3'],
        ['#c1', '#c2', '#c3'],
    ],
    rowsLabel: 'Consommation (%)',
    columnsLabel: 'Ménages (%)',
};

// Canevas de la carte : 400 × 300 px à l'écran, dessinés à une densité de 2
const MAP_CANVAS = { width: 800, height: 600, clientWidth: 400 } as HTMLCanvasElement;

type Drawing = { texts: string[]; fills: string[]; images: unknown[] };

// Remplace le contexte 2D de jsdom par un contexte qui consigne ce qui est dessiné
const recordDrawing = (): Drawing => {
    const drawing: Drawing = { texts: [], fills: [], images: [] };
    const context = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textBaseline: '',
        fillRect(this: { fillStyle: string }): void {
            drawing.fills.push(this.fillStyle);
        },
        strokeRect: (): void => undefined,
        fillText: (text: string) => drawing.texts.push(text),
        drawImage: (image: unknown) => drawing.images.push(image),
    };
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    jest.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,AAAA');
    return drawing;
};

// Images téléchargées : le lien créé pour chacune, avec son nom de fichier
const recordDownloads = (): HTMLAnchorElement[] => {
    const links: HTMLAnchorElement[] = [];
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click(this: HTMLAnchorElement): void {
        links.push(this);
    });
    return links;
};

// Carte dont le rendu est déclenché à la main
const fakeMap = () => {
    const listeners: (() => void)[] = [];
    const map = {
        getCanvas: () => MAP_CANVAS,
        once: (_event: string, listener: () => void) => listeners.push(listener),
        triggerRepaint: jest.fn(),
    };
    return { map: map as unknown as maplibregl.Map, triggerRepaint: map.triggerRepaint, renderFrame: () => listeners.splice(0).forEach((listener) => listener()) };
};

afterEach(() => jest.restoreAllMocks());

describe('image composée d’une carte MapLibre', () => {
    it('dessine le titre, le sous-titre, la carte, chaque ligne de légende puis les crédits', () => {
        const drawing = recordDrawing();
        const links = recordDownloads();

        downloadMapPng(fakeMap().map, INFO, ROWS);

        expect(drawing.texts).toEqual(['Titre de la carte', 'France entière · par commune', 'Classe basse', 'Classe haute', 'Crédits']);
        expect(drawing.images).toEqual([MAP_CANVAS]);
        expect(drawing.fills).toEqual(expect.arrayContaining(['#111111', '#222222']));
        expect(links.map((link) => link.download)).toEqual(['carte-france-comm.png']);
    });

    it('dessine la grille d’une carte bivariée, case par case, avec le nom de ses deux axes', () => {
        const drawing = recordDrawing();
        recordDownloads();

        downloadMapPng(fakeMap().map, INFO, GRID);

        expect(drawing.fills.filter((fill) => fill.startsWith('#a') || fill.startsWith('#b') || fill.startsWith('#c'))).toEqual(GRID.kind === 'grid' ? GRID.colors.flat() : []);
        expect(drawing.texts).toEqual(['Titre de la carte', 'France entière · par commune', '↓ Consommation (%)', '→ Ménages (%)', 'Crédits']);
    });

    it('réserve sous la carte la hauteur de sa légende', () => {
        expect(legendHeight({ kind: 'rows', rows: [] })).toBe(0);
        expect(legendHeight(ROWS)).toBe(44);
        // Trois cases de 18 px, et une demi-ligne avant les crédits
        expect(legendHeight(GRID)).toBe(65);
    });
});

describe('téléchargement de l’image', () => {
    it('attend le rendu d’une image de la carte, seul moment où son tampon est lisible', () => {
        recordDrawing();
        const links = recordDownloads();
        const { map, triggerRepaint, renderFrame } = fakeMap();

        exportMapPng(map, () => ({ info: INFO, legend: ROWS }));

        expect(triggerRepaint).toHaveBeenCalledTimes(1);
        expect(links).toEqual([]);

        renderFrame();

        expect(links).toHaveLength(1);
    });

    it('lit les textes et la légende au moment du rendu : ceux de ce que la carte dessine alors', () => {
        const drawing = recordDrawing();
        recordDownloads();
        const { map, renderFrame } = fakeMap();
        let info = INFO;

        exportMapPng(map, () => ({ info, legend: ROWS }));
        info = { ...INFO, title: 'Titre au moment du rendu' };
        renderFrame();

        expect(drawing.texts[0]).toBe('Titre au moment du rendu');
    });

    it('prévient l’utilisateur quand le navigateur ne peut pas composer l’image', () => {
        jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
        const links = recordDownloads();
        const { map, renderFrame } = fakeMap();

        exportMapPng(map, () => ({ info: INFO, legend: ROWS }));
        renderFrame();

        expect(links).toEqual([]);
        expect(showErrorToast).toHaveBeenCalledWith("Le téléchargement de l'image a échoué", 'Votre navigateur ne permet pas de générer cette carte en PNG.');
    });
});
