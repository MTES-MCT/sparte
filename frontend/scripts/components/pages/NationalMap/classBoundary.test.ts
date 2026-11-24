import Highcharts from 'highcharts';
import HighchartsMap from 'highcharts/modules/map';
import { naturalClasses, signedNaturalClasses, valueClassIndex } from './domain/classification';
import { ValueClass } from './values';

HighchartsMap(Highcharts);

// Chaque borne de classe est une valeur observée : il y a toujours des territoires exactement sur
// une borne. Une seule règle les range, pour la couleur du territoire, pour la ligne de légende qui
// le compte et pour le libellé de la classe : une valeur égale à une borne appartient à la classe
// supérieure. Ce test le vérifie avec le vrai Highcharts.

const VALUES = [1, 2, 3, 10, 11, 12, 100, 101, 102];
const FORMAT = { unit: 'ha' as const, decimals: 0 };

type Colored = { value: number; color?: string };

// Indice de la classe dont chaque territoire porte la couleur sur une vraie carte
const paintedClasses = (points: Colored[], classes: ValueClass[]): number[] => {
    const features = points.map((_, index) => ({
        type: 'Feature',
        properties: { land_id: String(index) },
        geometry: { type: 'Polygon', coordinates: [[[index * 2, 0], [index * 2 + 1, 0], [index * 2 + 1, 1], [index * 2, 1], [index * 2, 0]]] },
    }));
    const container = document.createElement('div');
    document.body.appendChild(container);
    const chart = Highcharts.mapChart(container, {
        chart: { map: { type: 'FeatureCollection', features } as unknown as Highcharts.GeoJSON, animation: false, width: 600, height: 400 },
        title: { text: undefined },
        accessibility: { enabled: false },
        colorAxis: { dataClasses: classes, dataClassColor: 'category' },
        plotOptions: { series: { animation: false } },
        series: [{ type: 'map', joinBy: 'land_id', data: points.map((point, index) => ({ land_id: String(index), ...point })) }],
    });
    const colors = chart.series[0].points.map((point) => point.color as string);
    chart.destroy();
    container.remove();
    return colors.map((color) => classes.findIndex((valueClass) => valueClass.color === color));
};

// Points tels que la carte les construit : la couleur de la classe est posée sur chaque territoire
const classed = (values: number[], classes: ValueClass[]): Colored[] => values.map((value) => ({ value, color: classes[valueClassIndex(value, classes)].color }));

describe('classe d’une valeur égale à une borne', () => {
    const classes = naturalClasses(VALUES, FORMAT).slice();

    it('part de classes dont chaque borne est la plus petite valeur de la classe qu’elle ouvre', () => {
        expect(classes.length).toBeGreaterThan(2);
        classes.slice(1).forEach((valueClass, index) => {
            const members = VALUES.filter((value) => valueClassIndex(value, classes) === index + 1);

            expect(valueClass.from).toBe(Math.min(...members));
            expect(valueClass.from).toBe(classes[index].to);
        });
    });

    it('la range dans la classe supérieure, celle que son libellé annonce', () => {
        const bound = classes[1].from as number;
        const index = valueClassIndex(bound, classes);

        expect(index).toBe(1);
        expect(classes[index].name.startsWith('De ') || classes[index].name.endsWith('et plus')).toBe(true);
        expect(classes[0].name.startsWith('Moins de ')).toBe(true);
    });

    it('le territoire est peint de la classe où la légende le compte', () => {
        expect(paintedClasses(classed(VALUES, classes), classes)).toEqual(VALUES.map((value) => valueClassIndex(value, classes)));
    });

    it('la règle est aussi celle de Highcharts, quand il choisit lui-même la couleur', () => {
        expect(paintedClasses(VALUES.map((value) => ({ value })), classes)).toEqual(VALUES.map((value) => valueClassIndex(value, classes)));
    });

    it('vaut de part et d’autre de zéro : une valeur nulle est peinte de la classe neutre, la plus petite hausse de la première classe de hausse', () => {
        const values = [-6, -5, -1, 0, 0, 0.1, 2, 9];
        const signed = signedNaturalClasses(values, { unit: '%' as const, decimals: 1 });
        const expected = values.map((value) => valueClassIndex(value, signed));

        expect(signed[expected[3]].name).toBe('0 %');
        expect(expected[5]).toBe(expected[3] + 1);
        expect(paintedClasses(classed(values, signed), signed)).toEqual(expected);
        expect(paintedClasses(values.map((value) => ({ value })), signed)).toEqual(expected);
    });
});
