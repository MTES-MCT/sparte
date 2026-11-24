import type { LayerSpecification } from 'maplibre-gl';
import { NO_DATA_COLOR } from '../../values';
import { DIMMED_NO_DATA_COLOR } from '../../domain/communes/colors';
import { NO_DATA_PATTERN_ID } from '../../domain/noData';
import { COMMUNES_FILL, COMMUNES_NO_DATA, COMMUNES_LAYERS, COMMUNES_SOURCE, COMMUNE_OUTLINE, DEPARTMENTS_SOURCE, FRAME_LAYERS, FRAME_SOURCES, communeOutlineFilter, communesSource } from './communesStyle';

const readsFeatureState = (layer: LayerSpecification): boolean => JSON.stringify(layer).includes('feature-state');
const sourceOf = (layer: LayerSpecification): string => (layer as { source: string }).source;
const communesLayers = COMMUNES_LAYERS.map(({ layer }) => layer);
const layerOf = (id: string) => communesLayers.find((layer) => layer.id === id) as LayerSpecification & { paint?: Record<string, unknown>; filter?: unknown; minzoom?: number };

describe('style de la carte des communes du pays', () => {
    it('lit les tuiles par l’identifiant des communes, pour que leur état les rejoigne', () => {
        expect(communesSource('https://tuiles.test/communes_national.pmtiles')).toEqual({
            type: 'vector',
            url: 'pmtiles://https://tuiles.test/communes_national.pmtiles',
            promoteId: 'land_id',
        });
        expect(communesLayers.every((layer) => (layer as { 'source-layer': string })['source-layer'] === 'communes_national')).toBe(true);
    });

    it('n’a que deux couches de la source des communes qui lisent l’état d’entité : l’aplat et les hachures du « sans donnée »', () => {
        const stateReaders = communesLayers.filter((layer) => sourceOf(layer) === COMMUNES_SOURCE && readsFeatureState(layer)).map((layer) => layer.id);

        expect(stateReaders).toEqual([COMMUNES_FILL, COMMUNES_NO_DATA]);
        // Les repères ne lisent que l'état de leur propre source
        expect(FRAME_LAYERS.filter((layer) => sourceOf(layer) === COMMUNES_SOURCE)).toEqual([]);
        expect(FRAME_LAYERS.filter(readsFeatureState).map(sourceOf)).toEqual([DEPARTMENTS_SOURCE]);
    });

    it('colore l’aplat par l’état « color » de chaque commune, gris à défaut, sans lissage', () => {
        expect(layerOf(COMMUNES_FILL).paint).toEqual({ 'fill-color': ['to-color', ['feature-state', 'color'], NO_DATA_COLOR], 'fill-antialias': false });
        expect(layerOf(COMMUNES_FILL).filter).toBeUndefined();
    });

    it('hachure les communes sans donnée d’après la couleur posée sur elles, et estompe leurs hachures avec elles', () => {
        const { paint } = layerOf(COMMUNES_NO_DATA) as { paint: Record<string, unknown> };

        expect(paint['fill-pattern']).toBe(NO_DATA_PATTERN_ID);
        // Pleines pour la couleur du « sans donnée », y compris tant qu'aucune couleur n'est posée ;
        // atténuées pour sa version estompée ; absentes pour toute autre couleur
        expect(paint['fill-opacity']).toEqual(['match', ['coalesce', ['feature-state', 'color'], NO_DATA_COLOR], NO_DATA_COLOR, 1, DIMMED_NO_DATA_COLOR, 0.3, 0]);
        expect(DIMMED_NO_DATA_COLOR).not.toBe(NO_DATA_COLOR);
    });

    it('ne dessine les contours des communes qu’à partir du zoom 7', () => {
        const outlines = communesLayers.filter((layer) => layer.type === 'line' && layer.id !== COMMUNE_OUTLINE) as { minzoom?: number }[];

        expect(outlines.map((layer) => layer.minzoom)).toEqual([7]);
    });

    it('glisse les aplats et les contours sous les limites des départements, le contour de la sélection par-dessus tout', () => {
        const firstFrameLayer = FRAME_LAYERS[0].id;

        expect(COMMUNES_LAYERS.map(({ layer, beforeId }) => [layer.id, beforeId])).toEqual([
            [COMMUNES_FILL, firstFrameLayer],
            [COMMUNES_NO_DATA, firstFrameLayer],
            [expect.any(String), firstFrameLayer],
            [COMMUNE_OUTLINE, undefined],
        ]);
    });

    it('ne dessine aucun contour de sélection tant qu’aucune commune n’est sélectionnée', () => {
        expect(layerOf(COMMUNE_OUTLINE).filter).toEqual(['==', ['get', 'land_id'], '']);
        expect(communeOutlineFilter(null)).toEqual(['==', ['get', 'land_id'], '']);
        expect(communeOutlineFilter('35238')).toEqual(['==', ['get', 'land_id'], '35238']);
    });

    it('rejoint les départements par leur identifiant, pour l’état de survol et de sélection', () => {
        expect(FRAME_SOURCES[DEPARTMENTS_SOURCE]).toMatchObject({ type: 'geojson', promoteId: 'land_id' });
    });
});
