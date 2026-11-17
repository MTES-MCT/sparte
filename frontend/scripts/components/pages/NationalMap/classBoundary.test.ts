import Highcharts from 'highcharts';
import HighchartsMap from 'highcharts/modules/map';
import { classIndexOf } from './domain/frame/render/choropleth';
import { ValueClass, naturalBreaksClasses } from './values';

HighchartsMap(Highcharts);

// Les bornes de Jenks sont des valeurs observées : il y a toujours des territoires exactement sur
// une borne. Ce test décrit, avec le vrai Highcharts, la classe qu'il leur donne sur la carte, et
// celle où la légende les compte.

const VALUES = [1, 2, 3, 10, 11, 12, 100, 101, 102];
const CLASSES = naturalBreaksClasses(VALUES, ['#aaaaaa', '#bbbbbb', '#cccccc'], { unit: 'ha', decimals: 0 });

// Indice de la classe dont Highcharts donne la couleur à chaque valeur, sur une vraie carte
const highchartsClasses = (values: number[], classes: ValueClass[]): number[] => {
    const features = values.map((_, index) => ({
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
        series: [{ type: 'map', joinBy: 'land_id', data: values.map((value, index) => ({ land_id: String(index), value })) }],
    });
    const colors = chart.series[0].points.map((point) => point.color as string);
    chart.destroy();
    container.remove();
    return colors.map((color) => classes.findIndex((valueClass) => valueClass.color === color));
};

describe('classe d’une valeur égale à une borne', () => {
    it('part de trois classes dont les bornes intérieures, 3 et 12, sont des valeurs observées', () => {
        expect(CLASSES.map(({ from, to }) => [from, to])).toEqual([
            [undefined, 3],
            [3, 12],
            [12, undefined],
        ]);
    });

    it('Highcharts la colorie dans la classe supérieure', () => {
        expect(highchartsClasses(VALUES, CLASSES)).toEqual([0, 0, 1, 1, 1, 2, 2, 2, 2]);
    });

    it('la légende la compte dans la classe inférieure : sur une borne, couleur et effectif divergent', () => {
        expect(VALUES.map((value) => classIndexOf(value, CLASSES, 'lower'))).toEqual([0, 0, 0, 1, 1, 1, 2, 2, 2]);
    });

    it('la règle de la classe supérieure est celle de Highcharts', () => {
        expect(VALUES.map((value) => classIndexOf(value, CLASSES, 'upper'))).toEqual(highchartsClasses(VALUES, CLASSES));
    });

    it('hors des bornes, la couleur et l’effectif concordent', () => {
        const inside = VALUES.filter((value) => value !== 3 && value !== 12);
        expect(highchartsClasses(inside, CLASSES)).toEqual(inside.map((value) => classIndexOf(value, CLASSES, 'lower')));
    });

    it('ne range dans aucune classe une valeur que les bornes n’encadrent pas', () => {
        const bounded: ValueClass[] = [{ from: 0, to: 10, color: '#aaaaaa', name: 'De 0 à 10' }];

        expect(classIndexOf(11, bounded, 'lower')).toBeNull();
        expect(classIndexOf(11, bounded, 'upper')).toBeNull();
        expect(classIndexOf(5, [], 'upper')).toBeNull();
    });
});
