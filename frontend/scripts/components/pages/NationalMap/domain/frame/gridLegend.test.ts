import { artifFrame, consoFrame } from '../../__fixtures__/frames';
import { ARTIF_FRANCE_BY_REGION, CONSO_FRANCE_BY_REGION, FRANCE_BY_REGION } from '../../__fixtures__/nationalMapFixtures';
import { gridExportOf, gridLegendViewOf, gridStageOf, legendScopeOf } from './gridLegend';
import type { GridRender, LegendModel, MapFrame } from './types';

const france = (indicatorId: string): MapFrame => consoFrame('FRANCE', FRANCE_BY_REGION, indicatorId, CONSO_FRANCE_BY_REGION);
const CHOROPLETH = france('conso_pct_surface');
// Carte de mailles sans image ni objets
const GRID = france('conso_ha_gridded');
// Carte de mailles que remplacent une image, puis des objets aux grands zooms
const SOILS = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_pct_gridded', ARTIF_FRANCE_BY_REGION);

const gridRenderOf = ({ render }: MapFrame): GridRender => {
    if (render.renderer !== 'grid') throw new Error('carte de mailles attendue');
    return render;
};

const gridLegendOf = ({ legend }: MapFrame): Extract<LegendModel, { kind: 'grid' }> => {
    if (legend.kind !== 'grid') throw new Error('légende de mailles attendue');
    return legend;
};

const SOILS_IMAGE_KEY = gridRenderOf(SOILS).image.key;

// La carte des sols, affichée, annonce ce qu'elle dessine
const soilsDrawing = (stage: 'cells' | 'image' | 'objects') => gridLegendViewOf(SOILS, gridRenderOf(SOILS), { stage, imageKey: SOILS_IMAGE_KEY });

describe('ce que dessine la carte de mailles', () => {
    it('dessine ses mailles tant qu’elle n’a rien annoncé, quand elle n’a pas d’image', () => {
        expect(gridStageOf(gridRenderOf(GRID), null)).toBe('cells');
        expect(gridStageOf(null, null)).toBe('cells');
    });

    it('montre d’emblée son image, sans passer par ses mailles', () => {
        expect(gridStageOf(gridRenderOf(SOILS), null)).toBe('image');
    });

    it('suit ce que la carte annonce pour son image', () => {
        expect(gridStageOf(gridRenderOf(SOILS), { stage: 'objects', imageKey: SOILS_IMAGE_KEY })).toBe('objects');
        expect(gridStageOf(gridRenderOf(SOILS), { stage: 'cells', imageKey: SOILS_IMAGE_KEY })).toBe('cells');
        expect(gridStageOf(gridRenderOf(GRID), { stage: 'objects', imageKey: null })).toBe('objects');
    });

    it('ignore une annonce faite pour une autre image, ou par une carte sans image', () => {
        expect(gridStageOf(gridRenderOf(SOILS), { stage: 'cells', imageKey: 'autre-image' })).toBe('image');
        expect(gridStageOf(gridRenderOf(SOILS), { stage: 'objects', imageKey: null })).toBe('image');
        expect(gridStageOf(gridRenderOf(GRID), { stage: 'objects', imageKey: SOILS_IMAGE_KEY })).toBe('cells');
    });
});

describe('légende de ce que dessine la carte de mailles', () => {
    it('est celle des mailles quand la carte les dessine', () => {
        const legend = gridLegendOf(SOILS);

        expect(soilsDrawing('cells')).toEqual({ stage: 'cells', legend, replacement: null, noData: legend.noData });
    });

    it('est celle de l’image qui les remplace, dont le fond colore la ligne « pas de donnée »', () => {
        const legend = gridLegendOf(SOILS);
        const view = soilsDrawing('image');

        expect(view.replacement).toBe(legend.image);
        expect(view.noData).toEqual({ label: legend.noData.label, color: legend.image.noDataColor });
    });

    it('est celle des objets aux grands zooms, avec la ligne « pas de donnée » des mailles', () => {
        const legend = gridLegendOf(SOILS);
        const view = soilsDrawing('objects');

        expect(view.replacement).toBe(legend.detail);
        expect(view.noData).toBe(legend.noData);
    });

    it('reste celle des mailles pour une carte sans image ni objets, quoi qu’elle annonce', () => {
        const legend = gridLegendOf(GRID);

        expect(gridLegendViewOf(GRID, gridRenderOf(GRID), { stage: 'objects', imageKey: null })).toEqual({
            stage: 'objects',
            legend,
            replacement: null,
            noData: legend.noData,
        });
    });

    it('n’existe pas tant que la carte de mailles se prépare sous une carte par territoire', () => {
        expect(gridLegendViewOf(CHOROPLETH, gridRenderOf(SOILS), null)).toEqual({ stage: 'image', legend: null, replacement: null, noData: null });
    });

    it('n’existe pas sans carte affichée', () => {
        expect(gridLegendViewOf(null, null, null)).toEqual({ stage: 'cells', legend: null, replacement: null, noData: null });
    });
});

describe('légende pour laquelle vaut une ligne mise en avant', () => {
    it('est celle de la carte affichée', () => {
        expect(legendScopeOf(CHOROPLETH.legend, gridLegendViewOf(CHOROPLETH, null, null))).toBe(CHOROPLETH.legend.signature);
        expect(legendScopeOf(SOILS.legend, soilsDrawing('cells'))).toBe(SOILS.legend.signature);
    });

    it('change quand l’image ou les objets remplacent les mailles : leurs lignes n’ont pas le même sens', () => {
        const scopes = [soilsDrawing('cells'), soilsDrawing('image'), soilsDrawing('objects')].map((view) => legendScopeOf(SOILS.legend, view));

        expect(new Set(scopes).size).toBe(3);
    });

    it('n’est aucune tant qu’aucune carte n’est affichée', () => {
        expect(legendScopeOf(undefined, gridLegendViewOf(null, null, null))).toBeNull();
    });
});

describe('image exportée d’une carte de mailles', () => {
    const rowNames = (view: ReturnType<typeof gridLegendViewOf>): string[] => {
        const { legend } = gridExportOf(SOILS, view);
        return legend.kind === 'rows' ? legend.rows.map((row) => row.name) : [];
    };

    it('décrit ce que la carte dessine : son sous-titre suit les mailles, l’image ou les objets', () => {
        const { exportMeta } = SOILS;

        expect(gridExportOf(SOILS, soilsDrawing('cells')).info.subtitle).toBe(exportMeta.subtitle);
        expect(gridExportOf(SOILS, soilsDrawing('image')).info.subtitle).toBe(exportMeta.imageSubtitle);
        expect(gridExportOf(SOILS, soilsDrawing('objects')).info.subtitle).toBe(exportMeta.detailSubtitle);
    });

    it('porte la légende de ce que la carte dessine, avec sa ligne « pas de donnée »', () => {
        const legend = gridLegendOf(SOILS);
        const names = (classes: { name: string }[]): string[] => [...classes.map(({ name }) => name), legend.noData.label];

        expect(rowNames(soilsDrawing('cells'))).toEqual(names(legend.classes));
        expect(rowNames(soilsDrawing('image'))).toEqual(names(legend.image.classes));
        expect(rowNames(soilsDrawing('objects'))).toEqual(names(legend.detail.classes));
    });

    it('donne à la ligne « pas de donnée » la couleur du fond de l’image', () => {
        const { legend } = gridExportOf(SOILS, soilsDrawing('image'));

        expect(legend.kind === 'rows' && legend.rows.at(-1).color).toBe(gridLegendOf(SOILS).image.noDataColor);
    });

    it('garde la légende du cadre pour une carte qui se prépare sous une autre', () => {
        const staged = gridExportOf(SOILS, gridLegendViewOf(CHOROPLETH, gridRenderOf(SOILS), null));

        expect(staged.legend).toEqual(gridExportOf(SOILS, soilsDrawing('cells')).legend);
        expect(staged.info.subtitle).toBe(SOILS.exportMeta.imageSubtitle);
    });
});
