// Calque des anneaux de la carte par territoire, dessiné dans le SVG du graphique Highcharts,
// par-dessus les territoires : un symbole par territoire, et non une série de camemberts par
// territoire, qui en compterait plus d'un millier pour les EPCI du pays. Dessinés dans le SVG, les
// anneaux figurent dans l'image exportée. Ils sont redessinés à chaque rendu du graphique, à la
// place que Highcharts vient de donner aux territoires.
import type * as Highcharts from 'highcharts';
import { SIGNED_SYMBOL_COLORS } from '../../artifIndicators';
import type { RingPoint, RingsRender } from '../../domain/frame/types';
import { ringArcPath, ringInnerRadius, ringMarkOf } from '../../domain/rings';
import { symbolRadius } from '../../values';

// Au-dessus des territoires et de leurs noms, sous l'infobulle
const RINGS_Z_INDEX = 5;
// Liseré blanc : les symboles qui se chevauchent restent distincts, et les deux arcs d'un anneau aussi
const OUTLINE = { stroke: '#ffffff', 'stroke-width': 0.75 };
const HOLE_COLOR = '#ffffff';
const LABEL_STYLE = { color: '#1a1a1a', fontSize: '10px', fontWeight: '600', textOutline: '2px #ffffff' };
// Décalage qui centre en hauteur un texte de cette taille, posé sur sa ligne de base
const LABEL_BASELINE_SHIFT = 3.5;

type Layer = { render: RingsRender; maxSize: number; group: Highcharts.SVGElement };

// Calque de chaque graphique : ses anneaux, le diamètre du plus grand et le groupe SVG qui les porte
const layers = new WeakMap<Highcharts.Chart, Layer>();

type Center = { x: number; y: number };

// Centre de chaque territoire dans le SVG du graphique : le point où Highcharts pose aussi les
// cercles proportionnels
const landCenters = (chart: Highcharts.Chart): Map<string, Center> => {
    const centers = new Map<string, Center>();
    chart.series[0].points.forEach((point) => {
        const { land_id: landId } = point.options as { land_id?: string };
        if (landId !== undefined && point.plotX !== undefined && point.plotY !== undefined) {
            centers.set(landId, { x: chart.plotLeft + point.plotX, y: chart.plotTop + point.plotY });
        }
    });
    return centers;
};

const drawMark = (renderer: Highcharts.SVGRenderer, group: Highcharts.SVGElement, { x, y }: Center, radius: number, ring: RingPoint): void => {
    const mark = ringMarkOf(radius * 2, ring.decreaseShare);
    if (mark.shape === 'disc') {
        renderer.circle(x, y, radius).attr({ fill: SIGNED_SYMBOL_COLORS[mark.flow], ...OUTLINE }).add(group);
        return;
    }
    // Le centre d'un anneau laisse voir le territoire, sauf sous la valeur qui y est écrite
    if (mark.labelled) renderer.circle(x, y, ringInnerRadius(radius)).attr({ fill: HOLE_COLOR }).add(group);
    mark.arcs.forEach((arc) => {
        renderer
            .path()
            .attr({ d: ringArcPath(x, y, radius, arc), fill: SIGNED_SYMBOL_COLORS[arc.flow], ...OUTLINE })
            .add(group);
    });
    if (mark.labelled) {
        renderer
            .text(ring.netLabel, x, y + LABEL_BASELINE_SHIFT)
            .attr({ align: 'center' })
            .css(LABEL_STYLE)
            .add(group);
    }
};

const draw = (chart: Highcharts.Chart, render: RingsRender, maxSize: number): void => {
    // Rien ne reste du dessin précédent, ni d'une autre taille ni d'une autre place
    layers.get(chart)?.group.destroy();
    // Les anneaux ne reçoivent pas le pointeur : le territoire reste la cible du survol et du clic
    const group = chart.renderer.g('national-map-rings').attr({ zIndex: RINGS_Z_INDEX }).css({ pointerEvents: 'none' }).add();
    layers.set(chart, { render, maxSize, group });
    const centers = landCenters(chart);
    render.rings.forEach((ring) => {
        const center = centers.get(ring.land_id);
        if (center) drawMark(chart.renderer, group, center, symbolRadius(ring.gross, render.maxValue, maxSize), ring);
    });
};

// Dessine les anneaux d'un graphique qui vient d'être rendu. `initialMaxSize` est le diamètre du
// plus grand anneau à la création du graphique ; ensuite, celui que la scène a demandé en dernier.
export const renderRings = (chart: Highcharts.Chart, render: RingsRender, initialMaxSize: number): void =>
    draw(chart, render, layers.get(chart)?.maxSize ?? initialMaxSize);

// Donne aux anneaux d'un graphique déjà créé le diamètre que demande la scène ; sans effet sur un
// graphique sans anneaux
export const resizeRings = (chart: Highcharts.Chart, maxSize: number): void => {
    const layer = layers.get(chart);
    if (layer && layer.maxSize !== maxSize) draw(chart, layer.render, maxSize);
};
