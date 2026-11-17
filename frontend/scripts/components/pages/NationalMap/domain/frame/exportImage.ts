// Image exportée d'une carte MapLibre : elle est composée par le navigateur (titre, carte,
// légende, crédits) et ne peut pas reprendre la légende de la page. Ce fichier dit ce qu'elle
// contient, d'après ce que la carte dessine à cet instant.
import type { GridStage } from '../grid/cells';
import type { ValueClass } from '../../values';
import { NO_DATA_COLOR } from '../../values';
import type { ExportMeta, LegendModel } from './types';

// Textes de l'image
export type MapImageInfo = Pick<ExportMeta, 'title' | 'subtitle' | 'filename' | 'credits'>;

// Textes de l'image d'une carte. `gridStage` : pour une carte de mailles, ce qu'elle dessine ;
// son sous-titre décrit l'image ou les objets quand ils ont remplacé les mailles.
export const exportInfoOf = ({ title, subtitle, detailSubtitle, imageSubtitle, filename, credits }: ExportMeta, gridStage: GridStage | null = null): MapImageInfo => {
    const staged = { cells: subtitle, image: imageSubtitle, objects: detailSubtitle }[gridStage ?? 'cells'];
    return { title, subtitle: staged ?? subtitle, filename, credits };
};

// Légende de l'image. Deux formes : des lignes « couleur, libellé », ou la grille d'une carte
// bivariée avec le nom de ses deux axes.

export type ExportLegend =
    | { kind: 'rows'; rows: { color: string; name: string }[] }
    // `colors` : une ligne de la grille par niveau de la grandeur des lignes, du plus faible au plus fort
    | { kind: 'grid'; colors: string[][]; rowsLabel: string; columnsLabel: string };

const NO_LEGEND: ExportLegend = { kind: 'rows', rows: [] };
const NO_DATA_NAME = 'Donnée non disponible';

const rowsOf = (classes: ValueClass[], noData: { label: string; color: string } | null): ExportLegend => ({
    kind: 'rows',
    rows: [...classes.map(({ color, name }) => ({ color, name })), ...(noData ? [{ color: noData.color, name: noData.label }] : [])],
});

// Ce qu'une carte de mailles dessine à cet instant : ses mailles, l'image ou les objets qui les
// remplacent. La légende exportée est celle de ce qui est à l'écran.
export type GridLegendStage = { classes: ValueClass[]; noData: { label: string; color: string } | null };

// Légende exportée d'une carte MapLibre, d'après la légende affichée. `gridStage` : pour une carte
// de mailles, les classes et la ligne « sans donnée » de ce qu'elle dessine.
export const exportLegendOf = (legend: LegendModel, gridStage: GridLegendStage | null = null): ExportLegend => {
    if (legend.kind === 'grid') return rowsOf((gridStage ?? legend).classes, (gridStage ?? legend).noData);
    if (legend.kind === 'classes') return rowsOf(legend.classes, legend.noDataCount > 0 ? { label: NO_DATA_NAME, color: NO_DATA_COLOR } : null);
    if (legend.kind === 'bivariate' && legend.props) {
        const { colorGrid, consoLabel, indicName, indicUnit } = legend.props;
        // Les deux axes de la légende de la page : la consommation en lignes, l'indicateur croisé en colonnes
        return { kind: 'grid', colors: colorGrid, rowsLabel: `${consoLabel} (%)`, columnsLabel: indicUnit ? `${indicName} (${indicUnit})` : indicName };
    }
    // Symboles proportionnels : dessinés par Highcharts, qui exporte sa propre image
    return NO_LEGEND;
};
