import { act, renderHook } from '@testing-library/react';
import { UNMEASURED_STAGE, stageSizeOf } from '../domain/stage';
import { resizeObserverStub } from '../__fixtures__/resizeObserverStub';
import { useStageSize } from './useStageSize';

// jsdom ne calcule aucune mise en page : l'élément mesuré rend la taille que le test lui donne
const elementOf = (width: number, height: number): HTMLElement => {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => ({ width, height, x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, toJSON: () => ({}) });
    return element;
};

const resizeTo = (width: number, height: number): void => act(() => resizeObserverStub.resize(width, height));

const follow = (element: HTMLElement | null, onResize: () => void = () => undefined) => {
    const frameRef = { current: element };
    return renderHook(() => useStageSize(frameRef, onResize));
};

beforeEach(resizeObserverStub.install);

afterEach(resizeObserverStub.remove);

describe('useStageSize', () => {
    it('connaît la taille du cadre dès son premier rendu abouti, sans attendre l’observateur', () => {
        const { result } = follow(elementOf(358, 506));

        expect(result.current).toEqual(stageSizeOf(358, 506));
    });

    it('n’observe que le cadre, avec un seul observateur', () => {
        const element = elementOf(656, 595);
        follow(element);

        expect(resizeObserverStub.observers.map(({ observed }) => observed)).toEqual([[element]]);
    });

    it('suit les changements de taille du cadre', () => {
        const { result } = follow(elementOf(656, 595));
        resizeTo(358, 506);

        expect(result.current).toEqual(stageSizeOf(358, 506));
    });

    it('suit un changement de hauteur seule', () => {
        const { result } = follow(elementOf(700, 595));
        resizeTo(700, 352);

        expect(result.current).toEqual(stageSizeOf(700, 352));
        expect(result.current.legendPlacement).toBe('side');
    });

    it('rend le même objet tant que la taille ne change rien à la scène', () => {
        const { result } = follow(elementOf(656, 595));
        const before = result.current;
        resizeTo(700, 620);

        expect(result.current).toBe(before);
    });

    it('tient la carte pour masquée quand le cadre perd sa largeur, sans rien changer d’autre à la scène', () => {
        const { result } = follow(elementOf(358, 506));
        resizeTo(0, 0);

        expect(result.current).toEqual({ ...stageSizeOf(358, 506), hidden: true });
    });

    it('rend la scène visible dans le rappel même de l’observateur au retour d’une carte masquée, pas un rendu plus tard', () => {
        const { result } = follow(elementOf(358, 506));
        resizeTo(0, 0);
        let hiddenRightAfterResize: boolean | undefined;
        act(() => {
            resizeObserverStub.resize(358, 506);
            hiddenRightAfterResize = result.current.hidden;
        });

        expect(hiddenRightAfterResize).toBe(false);
        expect(result.current).toEqual(stageSizeOf(358, 506));
    });

    it('suit un changement de taille ordinaire au rendu suivant, sans rendu forcé', () => {
        const { result } = follow(elementOf(656, 595));
        let compactRightAfterResize: boolean | undefined;
        act(() => {
            resizeObserverStub.resize(358, 506);
            compactRightAfterResize = result.current.compact;
        });

        expect(compactRightAfterResize).toBe(false);
        expect(result.current.compact).toBe(true);
    });

    it('tient le cadre pour une grande carte tant qu’il n’a pas de largeur', () => {
        const { result } = follow(elementOf(0, 0));

        expect(result.current).toBe(UNMEASURED_STAGE);
    });

    it('prévient à chaque changement de taille, cadre masqué compris', () => {
        const onResize = jest.fn();
        follow(elementOf(656, 595), onResize);
        resizeTo(700, 620);
        resizeTo(0, 0);

        expect(onResize).toHaveBeenCalledTimes(2);
    });

    it('cesse d’observer quand la carte est retirée', () => {
        const { unmount } = follow(elementOf(656, 595));
        unmount();

        expect(resizeObserverStub.observers[0].disconnected).toBe(true);
    });

    it('mesure le cadre même sans observateur de taille', () => {
        resizeObserverStub.remove();

        expect(follow(elementOf(358, 506)).result.current).toEqual(stageSizeOf(358, 506));
    });
});
