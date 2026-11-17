// Points du nuage d'une carte bivariée, dessinés dans le SVG du graphique Highcharts : un tracé
// par couleur, et non un élément par point. Chaque élément ajouté à la page est examiné par le
// script du système de design de l'État : avec un élément par point, le nuage des 4 293 communes
// de Nouvelle-Aquitaine bloquait la page plus d'une seconde après l'affichage de sa carte
// (mesuré). Dessinés dans le SVG, les points figurent dans l'image exportée. Ils sont redessinés
// à chaque rendu du graphique, à la place que ses axes viennent de leur donner.
import type * as Highcharts from 'highcharts';
import type { ScatterPoint } from '../domain/frame/types';

// Au-dessus des seuils, sous le point survolé, que Highcharts dessine avec la série
const POINTS_Z_INDEX = 2;
// Liseré blanc : les points qui se chevauchent restent distincts. Sa largeur suit leur rayon, pour
// ne pas éteindre la couleur des plus petits.
export const OUTLINE_COLOR = '#ffffff';
export const outlineWidthOf = (radius: number): number => Math.round((radius / 7) * 100) / 100;

type Place = { x: number; y: number };

// Au dixième de pixel : de quoi placer un point, sans allonger le tracé de décimales inutiles
const rounded = (value: number): number => Math.round(value * 10) / 10;

// Tracé d'un disque : deux demi-cercles
const discPath = ({ x, y }: Place, radius: number): string =>
    `M${rounded(x - radius)} ${rounded(y)}a${radius} ${radius} 0 1 0 ${2 * radius} 0a${radius} ${radius} 0 1 0 ${-2 * radius} 0z`;

// Tracé des disques de chaque couleur, d'après la place de chaque point dans le graphique
export const discPathsByColor = (points: ScatterPoint[], placeOf: (point: ScatterPoint) => Place, radius: number): Map<string, string> => {
    const paths = new Map<string, string>();
    points.forEach((point) => paths.set(point.color, (paths.get(point.color) ?? '') + discPath(placeOf(point), radius)));
    return paths;
};

// Groupe SVG des points de chaque graphique
const layers = new WeakMap<Highcharts.Chart, Highcharts.SVGElement>();

// Dessine les points d'un graphique qui vient d'être rendu
export const renderScatterPoints = (chart: Highcharts.Chart, points: ScatterPoint[], radius: number): void => {
    // Rien ne reste du dessin précédent, fait pour une autre taille du graphique
    layers.get(chart)?.destroy();
    // Les points ne reçoivent pas le pointeur : Highcharts cherche lui-même le plus proche
    const group = chart.renderer.g('national-map-scatter-points').attr({ zIndex: POINTS_Z_INDEX }).css({ pointerEvents: 'none' }).add();
    layers.set(chart, group);
    const [xAxis] = chart.xAxis;
    const [yAxis] = chart.yAxis;
    discPathsByColor(points, ({ x, y }) => ({ x: xAxis.toPixels(x, false), y: yAxis.toPixels(y, false) }), radius).forEach((d, color) => {
        chart.renderer
            .path()
            .attr({ d, fill: color, stroke: OUTLINE_COLOR, 'stroke-width': outlineWidthOf(radius) })
            .add(group);
    });
};
