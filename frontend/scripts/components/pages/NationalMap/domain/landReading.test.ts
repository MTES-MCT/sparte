import { ZONE_FRANCE } from '../zones';
import { consoFrame } from '../__fixtures__/frames';
import { CONSO_FRANCE_BY_REGION, FRANCE_BY_REGION } from '../__fixtures__/nationalMapFixtures';
import type { FrameRender, MapFrame } from './frame/types';
import { landReadingOf, landSwatch } from './landReading';

const france = (indicatorId: string): MapFrame => consoFrame(ZONE_FRANCE, FRANCE_BY_REGION, indicatorId, CONSO_FRANCE_BY_REGION);
const plain = (text: string): string => text.replace(/[  ]/g, ' ');

type Territory = Extract<FrameRender, { renderer: 'territory' }>;
const CLASSES = [
    { from: 0, to: 1, color: '#aaaaaa', name: 'Jusqu’à 1 %' },
    { from: 1, to: 2, color: '#555555', name: 'De 1 à 2 %' },
];
const choropleth = { renderer: 'territory', mode: 'choropleth', points: [], classes: CLASSES } as Territory;

describe('landSwatch', () => {
    it('donne la couleur de la classe dont le territoire est peint, la classe supérieure pour une valeur égale à une borne', () => {
        expect(landSwatch(choropleth, { value: 0.4, legendKey: 0 })).toBe('#aaaaaa');
        expect(landSwatch(choropleth, { value: 1, legendKey: 0 })).toBe('#555555');
    });

    it('reprend la couleur propre au territoire d’une carte bivariée', () => {
        const bivariate = { renderer: 'territory', mode: 'bivariate', points: [], crossing: null } as Territory;

        expect(landSwatch(bivariate, { value: 4, color: '#5ac8c8', legendKey: 4 })).toBe('#5ac8c8');
    });

    it('ne donne rien sans donnée, ni sur une carte en cercles ou en anneaux', () => {
        const symbols = { renderer: 'territory', mode: 'symbols', points: [], symbols: [], maxValue: 0, color: '#000091' } as Territory;

        expect(landSwatch(choropleth, { value: null, color: '#cccccc', legendKey: null })).toBeNull();
        expect(landSwatch(symbols, { value: 12, color: '#eeeef8', legendKey: 0 })).toBeNull();
    });
});

describe('landReadingOf', () => {
    it('lit un territoire de la carte affichée et propose d’ouvrir sa zone', () => {
        const frame = france('conso_pct_surface');
        const [point] = frame.render.renderer === 'territory' ? frame.render.points.filter(({ value }) => value !== null) : [];
        const reading = landReadingOf(frame, point.land_id);

        expect(reading.tip.title).toBe(point.name);
        expect(plain(reading.tip.measures[0].value)).toMatch(/ %$/);
        expect(reading.tip.swatch).toMatch(/^#/);
        expect(reading.opens).toEqual({ zone: point.zone, name: point.name });
    });

    it('ne propose pas d’ouvrir un territoire d’une carte dont le clic ne descend pas', () => {
        const frame = france('conso_pct_surface');
        const communes = { ...frame, base: { ...frame.base, clickable: false } };
        const [point] = frame.render.renderer === 'territory' ? frame.render.points : [];

        expect(landReadingOf(communes, point.land_id).opens).toBeNull();
    });

    it('suit la carte : la même lecture change avec l’indicateur', () => {
        const share = landReadingOf(france('conso_pct_surface'), '53');
        const hectares = landReadingOf(france('conso_ha'), '53');

        expect(share.tip.title).toBe(hectares.tip.title);
        expect(share.tip.measures).not.toEqual(hectares.tip.measures);
        expect(hectares.tip.swatch).toBeNull();
    });

    it('ne lit rien sans carte, sans territoire désigné, ni pour un territoire que la carte ne montre pas', () => {
        expect(landReadingOf(null, '53')).toBeNull();
        expect(landReadingOf(france('conso_pct_surface'), null)).toBeNull();
        expect(landReadingOf(france('conso_pct_surface'), 'inconnu')).toBeNull();
    });
});
