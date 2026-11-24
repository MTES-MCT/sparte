import { artifFrame, consoFrame } from '../../__fixtures__/frames';
import { ARTIF_FRANCE_BY_REGION, CONSO_FRANCE_BY_REGION, FRANCE_BY_REGION } from '../../__fixtures__/nationalMapFixtures';
import { NO_DATA_COLOR } from '../../values';
import { SOIL_IMAGE_CLASSES } from '../grid/soilImage';
import { exportInfoOf, exportLegendOf } from './exportImage';
import type { LegendModel, MapFrame } from './types';

const france = (indicatorId: string): MapFrame => consoFrame('FRANCE', FRANCE_BY_REGION, indicatorId, CONSO_FRANCE_BY_REGION);
const CHOROPLETH = france('conso_pct_surface');
const BIVARIATE = france('bivariate_habitat_menages');
const SYMBOLS = france('conso_ha');
const GRID = france('conso_ha_gridded');
const SOILS = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_soils', ARTIF_FRANCE_BY_REGION);

const gridLegendOf = ({ legend }: MapFrame): Extract<LegendModel, { kind: 'grid' }> => {
    if (legend.kind !== 'grid') throw new Error('légende de mailles attendue');
    return legend;
};

describe('textes de l’image exportée', () => {
    it('reprend le titre, le sous-titre, le nom du fichier et les crédits du cadre, et rien d’autre', () => {
        expect(exportInfoOf(CHOROPLETH.exportMeta)).toEqual({
            title: CHOROPLETH.exportMeta.title,
            subtitle: CHOROPLETH.exportMeta.subtitle,
            filename: 'carte-france-region-conso_pct_surface',
            credits: CHOROPLETH.exportMeta.credits,
        });
    });

    it('décrit ce que la carte des sols dessine : ses mailles, l’image de l’IGN ou les objets', () => {
        const { exportMeta } = SOILS;

        expect(exportInfoOf(exportMeta, 'cells').subtitle).toBe(exportMeta.subtitle);
        expect(exportInfoOf(exportMeta, 'image').subtitle).toBe("France entière · image de l'OCS GE (IGN), sols artificialisés ou non · génération 2021-2023");
        expect(exportInfoOf(exportMeta, 'objects').subtitle).toBe('France entière · objets OCS GE, artificialisés ou non · dernier millésime de chaque département');
    });

    it('garde le sous-titre des mailles pour une carte qui n’a ni image ni objets', () => {
        expect(exportInfoOf(GRID.exportMeta, 'image').subtitle).toBe(GRID.exportMeta.subtitle);
        expect(exportInfoOf(GRID.exportMeta, 'objects').subtitle).toBe(GRID.exportMeta.subtitle);
    });
});

describe('légende de l’image exportée', () => {
    it('liste les classes d’un aplat, dans l’ordre de la légende', () => {
        const { legend } = CHOROPLETH;
        if (legend.kind !== 'classes') throw new Error('légende de classes attendue');

        expect(exportLegendOf(legend)).toEqual({ kind: 'rows', rows: legend.classes.map(({ color, name }) => ({ color, name })) });
    });

    it('ajoute la ligne des territoires sans donnée quand il y en a', () => {
        const { legend } = CHOROPLETH;
        if (legend.kind !== 'classes') throw new Error('légende de classes attendue');
        const exported = exportLegendOf({ ...legend, noDataCount: 3 });

        expect(exported.kind === 'rows' && exported.rows.at(-1)).toEqual({ color: NO_DATA_COLOR, name: 'Donnée non disponible' });
    });

    it('rend la grille d’une carte bivariée et le nom de ses deux axes, comme la légende de la page', () => {
        const { legend } = BIVARIATE;
        if (legend.kind !== 'bivariate' || !legend.props) throw new Error('légende bivariée attendue');
        const exported = exportLegendOf(legend);

        expect(exported).toEqual({
            kind: 'grid',
            colors: legend.props.colorGrid,
            rowsLabel: `${legend.props.consoLabel} (%)`,
            columnsLabel: `${legend.props.indicName} (${legend.props.indicUnit})`,
        });
    });

    it('liste les classes des mailles d’une carte carroyée, sans ligne « sans donnée » quand elle n’en a pas', () => {
        const legend = gridLegendOf(GRID);

        expect(exportLegendOf(legend)).toEqual({ kind: 'rows', rows: legend.classes.map(({ color, name }) => ({ color, name })) });
    });

    it('suit ce que la carte des sols dessine : sous l’image, les deux natures de sol et le fond sans donnée', () => {
        const legend = gridLegendOf(SOILS);
        const noData = { label: 'Pas de donnée OCS GE', color: legend.image.noDataColor };

        expect(exportLegendOf(legend, { classes: legend.image.classes, noData })).toEqual({
            kind: 'rows',
            rows: [...SOIL_IMAGE_CLASSES.map(({ color, name }) => ({ color, name })), { color: noData.color, name: noData.label }],
        });
    });

    it('ne rend aucune ligne pour des symboles proportionnels, que Highcharts exporte lui-même', () => {
        expect(exportLegendOf(SYMBOLS.legend)).toEqual({ kind: 'rows', rows: [] });
    });
});
