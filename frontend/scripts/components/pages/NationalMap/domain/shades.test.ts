import { lightnessOf, shadeOfLightness } from './shades';

describe('clarté d’une couleur', () => {
    it('va de 0 pour le noir à 100 pour le blanc', () => {
        expect(lightnessOf('#000000')).toBeCloseTo(0, 5);
        expect(lightnessOf('#ffffff')).toBeCloseTo(100, 3);
    });

    it('classe les couleurs comme l’œil : un jaune vif est plus clair qu’un bleu vif', () => {
        expect(lightnessOf('#ffff00')).toBeGreaterThan(lightnessOf('#0000ff') + 40);
    });
});

describe('nuance d’une couleur à une clarté donnée', () => {
    const VIOLET = '#6a6af4';
    const PALE_ORANGE = '#eeb088';

    it.each([
        [VIOLET, 90],
        [VIOLET, 42],
        [PALE_ORANGE, 90],
        [PALE_ORANGE, 42],
    ])('donne à %s la clarté %d, à un point près', (color, lightness) => {
        expect(Math.abs(lightnessOf(shadeOfLightness(color, lightness)) - lightness)).toBeLessThan(1);
    });

    it('rend la couleur elle-même à sa propre clarté', () => {
        expect(shadeOfLightness(VIOLET, lightnessOf(VIOLET))).toBe(VIOLET);
        expect(shadeOfLightness(PALE_ORANGE, lightnessOf(PALE_ORANGE))).toBe(PALE_ORANGE);
    });

    it('éclaircit vers le blanc et assombrit vers le noir', () => {
        expect(shadeOfLightness(VIOLET, 100)).toBe('#ffffff');
        expect(shadeOfLightness(VIOLET, 0)).toBe('#000000');
    });

    it('garde la teinte : les composantes restent dans le même ordre', () => {
        // Orange pâle : rouge > vert > bleu, éclairci comme assombri
        [90, 66, 42].forEach((lightness) => {
            const shade = shadeOfLightness(PALE_ORANGE, lightness);
            const [red, green, blue] = [1, 3, 5].map((start) => Number.parseInt(shade.slice(start, start + 2), 16));
            expect(red).toBeGreaterThan(green);
            expect(green).toBeGreaterThan(blue);
        });
    });
});
