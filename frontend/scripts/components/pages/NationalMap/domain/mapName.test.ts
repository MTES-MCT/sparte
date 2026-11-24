import { indicatorOf } from '../__fixtures__/frames';
import { ARTIF_INDICATORS } from '../artifIndicators';
import { Indicator, IndicatorUnit, MAP_INDICATORS } from '../indicators';
import { availableScales } from '../zones';
import { mapNameOf } from './mapName';
import { View, ViewProfile, isDenseView, viewProfileOf } from './viewProfile';

const CATALOG: Indicator[] = [...MAP_INDICATORS, ...ARTIF_INDICATORS];

const RINGS = indicatorOf('artif_desartif_ha');
const NET_SHARE_LABEL = 'Artificialisation nette entre les deux derniers millésimes (en pourcentage de la surface du territoire)';

const NATIONAL_ZONES = ['FRANCE', 'HEXAGONE'];
// Guadeloupe, Auvergne-Rhône-Alpes, Rhône, Métropole de Lyon
const TERRITORIES = ['REGION_01', 'REGION_84', 'DEPART_69', 'EPCI_200046977'];

describe('nom de la carte en anneaux', () => {
    it('est son libellé là où la carte dessine des anneaux : toutes les mailles d’une zone nationale sauf la commune', () => {
        NATIONAL_ZONES.forEach((zone) => {
            ['REGION', 'DEPART', 'EPCI'].forEach((scale) => {
                expect(mapNameOf({ zone, scale }, RINGS)).toEqual({
                    label: 'Artificialisation et désartificialisation entre les deux derniers millésimes (en hectares)',
                    standIn: null,
                });
            });
        });
    });

    it('est son libellé pour les communes d’une région, d’un département ou d’un EPCI, outre-mer compris', () => {
        TERRITORIES.forEach((zone) => {
            expect(mapNameOf({ zone, scale: 'COMM' }, RINGS)).toEqual({ label: RINGS.label, standIn: null });
        });
    });

    it('est celui de l’artificialisation nette en pourcentage pour toutes les communes du pays, et dit pourquoi', () => {
        NATIONAL_ZONES.forEach((zone) => {
            expect(mapNameOf({ zone, scale: 'COMM' }, RINGS)).toEqual({
                label: NET_SHARE_LABEL,
                standIn:
                    "À l'échelle du pays, des anneaux par commune ne seraient pas lisibles : la carte représente l'artificialisation nette " +
                    'rapportée à la surface de chaque commune, et ses hectares sont donnés au survol',
            });
        });
    });

    it('porte alors le nom de ce que la vue dessine : l’artificialisation nette en pourcentage de la surface', () => {
        const view = { zone: 'FRANCE', scale: 'COMM' };

        expect(mapNameOf(view, RINGS).label).toBe('Artificialisation nette entre les deux derniers millésimes (en pourcentage de la surface du territoire)');
    });
});

describe('nom des cartes du catalogue', () => {
    const DENSE = { zone: 'FRANCE', scale: 'COMM' };
    const standIns = CATALOG.filter((indicator) => mapNameOf(DENSE, indicator).standIn);

    it('est le libellé de la carte sur toute vue par territoire', () => {
        [...NATIONAL_ZONES.map((zone) => ({ zone, scale: 'EPCI' })), ...TERRITORIES.map((zone) => ({ zone, scale: 'COMM' }))].forEach((view) => {
            CATALOG.forEach((indicator) => {
                expect(mapNameOf(view, indicator)).toEqual({ label: indicator.label, standIn: null });
            });
        });
    });

    it('n’est remplacé, pour toutes les communes du pays, que pour les cartes en hectares par territoire', () => {
        expect(standIns.map(({ id }) => id)).toEqual(['conso_ha', 'conso_habitat_ha', 'conso_activite_ha', 'artif_desartif_ha']);
    });

    it('est alors celui de la version relative, jamais en hectares', () => {
        standIns.forEach((indicator) => {
            const { label } = mapNameOf(DENSE, indicator);

            expect(label).toBe(indicator.relative.label);
            expect(label).not.toBe(indicator.label);
            expect(label).toMatch(/en pourcentage/);
            expect(label).not.toMatch(/hectares/);
        });
    });

    it('parle de cercles proportionnels pour une carte en cercles, d’anneaux pour la carte en anneaux', () => {
        standIns.forEach((indicator) => {
            const symbols = indicator.rings ? 'anneaux' : 'cercles proportionnels';

            expect(mapNameOf(DENSE, indicator).standIn).toContain(`des ${symbols} par commune ne seraient pas lisibles`);
        });
        expect(mapNameOf(DENSE, indicatorOf('conso_ha')).standIn).toBe(
            "À l'échelle du pays, des cercles proportionnels par commune ne seraient pas lisibles : la carte représente la valeur " +
                'rapportée à la surface de chaque commune, et les hectares sont donnés au survol',
        );
    });

    it('laisse leur nom aux cartes que la vue de toutes les communes dessine telles quelles', () => {
        CATALOG.filter((indicator) => !standIns.includes(indicator)).forEach((indicator) => {
            expect(mapNameOf(DENSE, indicator)).toEqual({ label: indicator.label, standIn: null });
        });
    });
});

// Règle de cartographie du projet : une valeur absolue (hectares, hectares par an) se lit à la
// taille d'un cercle ou d'un anneau, ou par sa version relative ; jamais en aplat de couleur.
// Vérifiée pour tout le catalogue, sur chaque maille de chaque sorte de zone.
describe('jamais d’aplat sous un titre en valeur absolue', () => {
    const ZONES = [...NATIONAL_ZONES, ...TERRITORIES];
    const VIEWS = ZONES.flatMap((zone) => availableScales(zone).map((scale) => ({ zone, scale })));
    const CASES = VIEWS.flatMap((view) => CATALOG.map((indicator) => ({ view, indicator, profile: viewProfileOf(view, indicator), name: mapNameOf(view, indicator) })));

    const isAbsolute = (unit?: IndicatorUnit): boolean => unit === 'ha' || unit === 'ha/an';
    const saysAbsolute = (label: string): boolean => /hectares/.test(label);
    // Aplat : la couleur couvre tout le territoire, dont la taille ferait alors la valeur
    const isFlat = ({ mode }: ViewProfile): boolean => mode === 'choropleth' || mode === 'bivariate';
    const at = ({ view, indicator }: { view: View; indicator: Indicator }): string => `${indicator.id} sur ${view.zone} par ${view.scale}`;

    it('couvre toutes les mailles de la France entière, de l’Hexagone, d’une région, d’un département et d’un EPCI', () => {
        expect(VIEWS).toHaveLength(4 + 4 + 3 + 3 + 2 + 1);
        expect(CASES).toHaveLength(VIEWS.length * CATALOG.length);
    });

    it('reconnaît un titre en valeur absolue au mot « hectares », dans tout le catalogue', () => {
        CATALOG.forEach(({ label, unit }) => {
            expect([label, saysAbsolute(label)]).toEqual([label, isAbsolute(unit)]);
        });
    });

    it('ne dessine en aplat ni hectares ni hectares par an, et ne titre aucun aplat en hectares', () => {
        const flat = CASES.filter(({ profile }) => isFlat(profile));

        expect(flat.filter(({ profile }) => isAbsolute(profile.drawn.unit)).map(at)).toEqual([]);
        expect(flat.filter(({ name }) => saysAbsolute(name.label)).map(at)).toEqual([]);
    });

    it('dessine chaque carte en hectares par territoire en cercles ou en anneaux, sinon par sa version relative, et le dit', () => {
        const inHectares = CASES.filter(({ indicator }) => isAbsolute(indicator.unit) && !indicator.gridded);
        const flat = inHectares.filter(({ profile }) => isFlat(profile));

        expect(inHectares.filter(({ profile }) => !isFlat(profile) && profile.mode !== 'symbols' && profile.mode !== 'rings').map(at)).toEqual([]);
        // Le seul aplat : toutes les communes d'une zone nationale
        expect(flat.filter(({ view }) => !isDenseView(view)).map(at)).toEqual([]);
        expect(flat).toHaveLength(2 * 4);
        flat.forEach(({ indicator, profile, name }) => {
            expect(profile.drawn.key).toBe(indicator.relative.key);
            expect(name).toEqual({ label: indicator.relative.label, standIn: expect.stringContaining('rapportée à la surface de chaque commune') });
        });
    });

    it('dit toujours, sous la ligne du menu, qu’une carte dessine une autre valeur que la sienne', () => {
        CASES.forEach(({ indicator, profile, name }) => {
            expect(name.standIn !== null).toBe(profile.drawn.key !== indicator.id);
            expect(name.label === indicator.label).toBe(name.standIn === null);
        });
    });
});
