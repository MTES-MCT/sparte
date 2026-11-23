import { hasOcsgeFlux } from './fluxUtils';

describe('hasOcsgeFlux', () => {
    it("retourne false sans index de flux (données absentes ou pas encore chargées)", () => {
        expect(hasOcsgeFlux(undefined, undefined)).toBe(false);
        expect(hasOcsgeFlux(null, null)).toBe(false);
    });

    it('retourne false quand les deux flux sont nuls', () => {
        expect(hasOcsgeFlux(0, 0)).toBe(false);
    });

    it("retourne true dès qu'un des deux flux est positif", () => {
        expect(hasOcsgeFlux(0.5, 0)).toBe(true);
        expect(hasOcsgeFlux(0, 1.2)).toBe(true);
        expect(hasOcsgeFlux(3, 4)).toBe(true);
        expect(hasOcsgeFlux(2, undefined)).toBe(true);
    });
});
