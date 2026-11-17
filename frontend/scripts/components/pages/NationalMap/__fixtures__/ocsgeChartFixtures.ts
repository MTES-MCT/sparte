// Graphiques de l'artificialisation tels que le serveur les décrit pour l'Ille-et-Vilaine, entre
// ses millésimes de 2017 et de 2020, réduits à ce que leurs présentations lisent et changent
import type * as Highcharts from 'highcharts';

const NO_ANIMATION = { chart: { animation: false }, accessibility: { enabled: false }, plotOptions: { series: { animation: false } } } as const;

// Part artificialisée à chaque millésime : les barres, le trait du flux entre elles et son étiquette
export const shareChart = (categories = ['2017', '2020']): Highcharts.Options =>
    ({
        ...NO_ANIMATION,
        chart: { ...NO_ANIMATION.chart, type: 'column' },
        title: { text: 'Evolution du stock de surfaces artificialisées de Ille-et-Vilaine entre 2017 et 2020' },
        legend: { enabled: false },
        xAxis: { categories },
        yAxis: { title: { text: 'Part artificialisée (%)' }, labels: { format: '{value}%' } },
        plotOptions: { ...NO_ANIMATION.plotOptions, column: { dataLabels: { enabled: true, format: '{point.y:.2f}%<br/>({point.surface:,.0f} ha)' } } },
        series: [
            { name: 'Part artificialisée', type: 'column', color: '#818CF8', data: [{ y: 12.484, surface: 85282.18 }, { y: 12.698, surface: 86746.95 }].slice(0, categories.length) },
            { name: 'Flux', type: 'line', color: '#F97316', data: [{ x: 0, y: 12.484 }, { x: 1, y: 12.698 }] },
            { name: 'Flux label 1', type: 'scatter', data: [{ x: 0.5, y: 12.59, name: '+1,464.8 ha' }] },
        ],
    }) as Highcharts.Options;

// Artificialisation, désartificialisation et artificialisation nette : trois colonnes en rouge, vert et indigo
export const flowsChart = (): Highcharts.Options =>
    ({
        ...NO_ANIMATION,
        chart: { ...NO_ANIMATION.chart, type: 'column' },
        title: { text: 'Artificialisation nette entre 2017 et 2020' },
        legend: { enabled: false },
        xAxis: { type: 'category' },
        yAxis: { title: { text: 'Surface (en ha)' } },
        series: [
            {
                data: [
                    { name: 'Artificialisation', y: 1620.13, color: '#FA4B42' },
                    { name: 'Désartificialisation', y: -151.94, color: '#00E272' },
                    { name: 'Artificialisation nette', y: 1468.19, color: '#6A6AF4' },
                ],
            },
        ],
    }) as Highcharts.Options;

const cover = (name: string, y: number, color: string, long_name = name) => ({ name, y, color, long_name, surface: y });

// Surfaces artificialisées par type de couverture : un disque de sept secteurs, dans l'ordre de la nomenclature
export const coversChart = (): Highcharts.Options =>
    ({
        ...NO_ANIMATION,
        chart: { ...NO_ANIMATION.chart, type: 'pie' },
        title: { text: 'Surfaces artificialisées par couverture  en 2020' },
        legend: { itemWidth: 200, layout: 'vertical', align: 'right', verticalAlign: 'middle' },
        tooltip: { pointFormat: '{point.long_name} - {point.percentage:.1f}% ({point.surface:,.1f} ha)' },
        series: [
            {
                name: 'Surface artificielle',
                data: [
                    cover('Zones bâties', 17608.19, '#ff377a'),
                    cover('Zones non bâties', 24916.84, '#ff9191', 'Zones non bâties (Routes; places; parking…)'),
                    cover('Zones à matériaux minéraux', 4301.36, '#ff9'),
                    cover("Surfaces d'eau", 37.67, '#00ccf2', "Surfaces d'eau (Eau continentale et maritime)"),
                    cover('Peuplement de feuillus', 905.92, '#80ff00'),
                    cover('Peuplement de conifères', 7.06, '#00a600'),
                    cover('Formations herbacées', 38960.15, '#ccf24d', 'Formations herbacées (Pelouses et prairies; terres arables; roselières; …)'),
                ],
            },
        ],
    }) as Highcharts.Options;

const category = (name: string, code: string, color: string): string => `${name} (${code}) <span style='color:${color}'></span>`;

// Les mêmes flux par type de couverture : trois séries, en colonnes comme le veut le type du
// graphique. `count` : nombre de couvertures dont le sol a changé, sur les sept de la réponse.
export const coverFlowsChart = (count = 7): Highcharts.Options => {
    const increases = [254.3, 244.07, 656.82, 120.4, 15.75, 60.2, 448.14].map((value, index) => (index < count ? value : 0));
    const decreases = [-18.99, -3.39, -100.48, -8.1, -1.22, -4.5, -27.61].map((value, index) => (index < count ? value : 0));
    return {
        ...NO_ANIMATION,
        chart: { ...NO_ANIMATION.chart, type: 'column' },
        title: { text: 'Artificialisation par couverture entre 2017 et 2020' },
        legend: { align: 'center', verticalAlign: 'top', layout: 'horizontal' },
        xAxis: {
            categories: [
                category('Zones bâties', 'CS1.1.1.1', '#ff377a'),
                category('Zones non bâties', 'CS1.1.1.2', '#ff9191'),
                category('Zones à matériaux minéraux', 'CS1.1.2.1', '#ff9'),
                category("Surfaces d'eau", 'CS1.2.2', '#00ccf2'),
                category('Peuplement de feuillus', 'CS2.1.1.1', '#80ff00'),
                category('Peuplement mixte', 'CS2.1.1.3', '#80be00'),
                category('Formations herbacées', 'CS2.2.1', '#ccf24d'),
            ],
        },
        yAxis: { title: { text: 'Surface (en ha)' }, plotLines: [{ value: 0, color: 'black', width: 2 }] },
        series: [
            { name: 'Artificialisation', data: increases, color: '#FA4B42' },
            { name: 'Désartificialisation', data: decreases, color: '#00E272' },
            { name: 'Artificialisation nette', data: increases.map((value, index) => value + decreases[index]), color: '#6A6AF4' },
        ],
    } as Highcharts.Options;
};
