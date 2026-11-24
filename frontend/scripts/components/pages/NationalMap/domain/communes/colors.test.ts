import type { NationalMapValues } from '@services/api';
import { COMMUNES_CONSO_SHARE, COMMUNES_HABITAT_MENAGES, communesColumn, realisticShares } from '../../__fixtures__/communesFixtures';
import { communesFrame } from '../../__fixtures__/frames';
import { CONSO_FRANCE_BY_DEPARTEMENT, FRANCE_BY_DEPARTEMENT } from '../../__fixtures__/nationalMapFixtures';
import { NO_DATA_COLOR, SEQUENTIAL_PALETTE } from '../../values';
import type { FrameRender } from '../frame/types';
import { CommuneColors, colorChanges, communeColors } from './colors';

type Communes = Extract<FrameRender, { renderer: 'communes' }>;

const renderOf = (zone: string, indicatorId: string, column: NationalMapValues): Communes => {
    const { render } = communesFrame(zone, indicatorId, column, { base: FRANCE_BY_DEPARTEMENT, conso: CONSO_FRANCE_BY_DEPARTEMENT });
    if (render.renderer !== 'communes') throw new Error('rendu des communes attendu');
    return render;
};

const FRANCE = renderOf('FRANCE', 'conso_pct_surface', COMMUNES_CONSO_SHARE);
const HEXAGONE = renderOf('HEXAGONE', 'conso_pct_surface', COMMUNES_CONSO_SHARE);

// Couleur de chaque commune, par identifiant
const byId = ({ ids, colors }: CommuneColors): Record<string, string> => Object.fromEntries(ids.map((id, rank) => [id, colors[rank]]));

// Couleur d'une commune hors de la zone affichée : transparente
const OUTSIDE_ZONE_COLOR = 'rgba(0, 0, 0, 0)';

// Couleurs estompées attendues : un cinquième de la couleur, quatre cinquièmes de blanc
const FADED = { first: '#f9f9ff', last: '#cccce9', noData: '#f8f8f8' };

describe('communeColors', () => {
    it('donne à chaque commune la couleur de sa classe, et le gris sans donnée', () => {
        const colors = byId(communeColors(FRANCE, null));

        expect(colors).toMatchObject({
            '75056': SEQUENTIAL_PALETTE[0],
            '69123': SEQUENTIAL_PALETTE[0],
            '2A004': SEQUENTIAL_PALETTE[1],
            '35238': SEQUENTIAL_PALETTE[2],
            '31555': SEQUENTIAL_PALETTE[3],
            '97302': SEQUENTIAL_PALETTE[4],
            '09304': NO_DATA_COLOR,
            '97611': NO_DATA_COLOR,
        });
        expect(Object.keys(colors)).toHaveLength(13);
    });

    it('rend transparentes les communes hors de la zone : la Corse et l’outre-mer sur l’Hexagone', () => {
        const colors = byId(communeColors(HEXAGONE, null));

        expect(colors).toMatchObject({ '2A004': OUTSIDE_ZONE_COLOR, '97302': OUTSIDE_ZONE_COLOR, '97611': OUTSIDE_ZONE_COLOR });
        expect(colors['35238']).toBe(SEQUENTIAL_PALETTE[3]);
        // Sans donnée dans la zone : la couleur du « sans donnée », que la carte hachure
        expect(colors['09304']).toBe(NO_DATA_COLOR);
    });

    it('estompe les communes des autres classes, et celles sans donnée, quand une classe est mise en avant', () => {
        const colors = byId(communeColors(FRANCE, 3));

        expect(colors).toMatchObject({ '84007': SEQUENTIAL_PALETTE[3], '31555': SEQUENTIAL_PALETTE[3] });
        expect(colors).toMatchObject({ '75056': FADED.first, '97302': FADED.last, '09304': FADED.noData });
        expect(byId(communeColors(FRANCE, 0))).toMatchObject({ '75056': SEQUENTIAL_PALETTE[0], '97302': FADED.last });
    });

    it('laisse transparentes les communes hors zone, classe mise en avant ou non', () => {
        expect(byId(communeColors(HEXAGONE, 4))).toMatchObject({ '2A004': OUTSIDE_ZONE_COLOR, '97611': OUTSIDE_ZONE_COLOR });
    });

    it('colore une carte bivariée par la palette de la réponse', () => {
        const colors = byId(communeColors(renderOf('FRANCE', 'bivariate_habitat_menages', COMMUNES_HABITAT_MENAGES), null));

        expect(colors).toMatchObject({ '35238': '#f08b5e', '75056': '#99d8c9', '09304': NO_DATA_COLOR });
    });
});

describe('colorChanges', () => {
    const PLAIN = communeColors(FRANCE, null);

    it('pose toutes les couleurs quand aucune ne l’est encore', () => {
        const changes = colorChanges(null, PLAIN);

        expect(changes).toHaveLength(13);
        expect(changes).toContainEqual({ id: '35238', color: SEQUENTIAL_PALETTE[2] });
    });

    it('ne pose rien quand rien ne change', () => {
        expect(colorChanges(PLAIN, communeColors(FRANCE, null))).toEqual([]);
    });

    it('ne pose, pour une mise en avant, que les couleurs des communes à estomper', () => {
        const changes = colorChanges(PLAIN, communeColors(FRANCE, 4));

        // La commune de la classe mise en avant, Cayenne, garde sa couleur
        expect(changes.map(({ id }) => id).sort()).toEqual(['09304', '22278', '29083', '2A004', '31555', '35238', '69123', '75056', '84007', '97304', '97608', '97611']);
        expect(changes).toContainEqual({ id: '75056', color: FADED.first });
    });

    it('ne pose, d’une classe mise en avant à une autre, que les couleurs des deux classes', () => {
        const changes = colorChanges(communeColors(FRANCE, 4), communeColors(FRANCE, 0));

        const byCommune = [...changes].sort((a, b) => a.id.localeCompare(b.id));

        expect(byCommune).toEqual([
            { id: '69123', color: SEQUENTIAL_PALETTE[0] },
            { id: '75056', color: SEQUENTIAL_PALETTE[0] },
            { id: '97302', color: FADED.last },
            { id: '97304', color: SEQUENTIAL_PALETTE[0] },
        ]);
    });

    it('ne pose, de la France entière à l’Hexagone, que les communes qui sortent de la zone ou changent de classe', () => {
        const changes = colorChanges(PLAIN, communeColors(HEXAGONE, null));
        const outside = changes.filter(({ color }) => color === OUTSIDE_ZONE_COLOR).map(({ id }) => id);

        expect(outside).toEqual(['2A004', '97302', '97304', '97608', '97611']);
        // Suzan et l'Île-de-Sein restent grises, Paris reste dans la première classe
        const changed = changes.map(({ id }) => id);
        ['09304', '29083', '75056'].forEach((id) => expect(changed).not.toContain(id));
    });

    it('repose tout quand la liste des communes a changé, et rend au gris celles qui ont disparu', () => {
        const before: CommuneColors = { ids: ['01001', '01002', '01003'], colors: ['#111111', '#222222', '#333333'] };
        const after: CommuneColors = { ids: ['01001', '01003', '01004'], colors: ['#111111', '#333333', '#444444'] };

        expect(colorChanges(before, after)).toEqual([
            { id: '01001', color: '#111111' },
            { id: '01003', color: '#333333' },
            { id: '01004', color: '#444444' },
            { id: '01002', color: NO_DATA_COLOR },
        ]);
    });

    it('compare deux réponses de mêmes communes par leur contenu, pas par l’identité de leurs listes', () => {
        const copy: CommuneColors = { ids: [...PLAIN.ids], colors: [...PLAIN.colors] };

        expect(colorChanges(PLAIN, copy)).toEqual([]);
    });

    it('ne touche, pour une mise en avant sur 34 875 communes, qu’aux communes des autres classes', () => {
        const render = renderOf('FRANCE', 'conso_pct_surface', communesColumn('conso_pct_surface', realisticShares(34875)));
        const plain = communeColors(render, null);
        const highlighted = communeColors(render, 2);
        const changes = colorChanges(plain, highlighted);
        const kept = highlighted.colors.filter((color) => color === SEQUENTIAL_PALETTE[2]).length;

        expect(kept).toBeGreaterThan(0);
        expect(changes).toHaveLength(34875 - kept);
    });
});
