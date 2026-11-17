import { createLandHighlight } from './landHighlight';

// Canal par lequel la carte et le nuage de points se désignent le territoire survolé

describe('createLandHighlight', () => {
    it('prévient une vue du territoire que l’autre désigne, puis de ce qu’elle n’en désigne plus', () => {
        const highlight = createLandHighlight();
        const onScatter = jest.fn();
        highlight.subscribe('scatter', onScatter);
        highlight.publish('map', '35');
        highlight.publish('map', null);

        expect(onScatter.mock.calls).toEqual([['35'], [null]]);
    });

    it('ne prévient pas une vue de ce qu’elle désigne elle-même', () => {
        const highlight = createLandHighlight();
        const onMap = jest.fn();
        const onScatter = jest.fn();
        highlight.subscribe('map', onMap);
        highlight.subscribe('scatter', onScatter);
        highlight.publish('scatter', '22');

        expect(onMap.mock.calls).toEqual([['22']]);
        expect(onScatter).not.toHaveBeenCalled();
    });

    it('ne prévient plus une vue qui a cessé d’écouter', () => {
        const highlight = createLandHighlight();
        const onMap = jest.fn();
        const stop = highlight.subscribe('map', onMap);
        stop();
        highlight.publish('scatter', '22');

        expect(onMap).not.toHaveBeenCalled();
    });

    it('prévient chaque écoute d’une même vue, et garde les autres quand l’une s’arrête', () => {
        const highlight = createLandHighlight();
        const first = jest.fn();
        const second = jest.fn();
        const stopFirst = highlight.subscribe('map', first);
        highlight.subscribe('map', second);
        highlight.publish('scatter', '22');
        stopFirst();
        highlight.publish('scatter', '35');

        expect(first.mock.calls).toEqual([['22']]);
        expect(second.mock.calls).toEqual([['22'], ['35']]);
    });

    it('ne dit rien sans écoute, et deux canaux s’ignorent', () => {
        const one = createLandHighlight();
        const other = createLandHighlight();
        const onMap = jest.fn();
        other.subscribe('map', onMap);

        expect(() => one.publish('scatter', '22')).not.toThrow();
        expect(onMap).not.toHaveBeenCalled();
    });
});
