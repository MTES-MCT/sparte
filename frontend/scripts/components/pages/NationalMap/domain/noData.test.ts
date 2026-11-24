import { NO_DATA_COLOR } from '../values';
import { NO_DATA_CSS_BACKGROUND, NO_DATA_HATCH_STEP_PX, NO_DATA_HIGHCHARTS_PATTERN, noDataPatternImage, swatchBackground } from './noData';

const pixel = ({ width, data }: { width: number; data: Uint8ClampedArray }, x: number, y: number): number[] => Array.from(data.slice((y * width + x) * 4, (y * width + x) * 4 + 4));

describe('motif des territoires sans donnée', () => {
    it('est un carreau opaque de deux couleurs : des traits gris sur fond blanc', () => {
        const image = noDataPatternImage(2);
        const colors = new Set<string>();
        for (let offset = 0; offset < image.data.length; offset += 4) colors.add(Array.from(image.data.slice(offset, offset + 4)).join(','));

        expect([image.width, image.height]).toEqual([NO_DATA_HATCH_STEP_PX * 2, NO_DATA_HATCH_STEP_PX * 2]);
        expect([...colors].sort()).toEqual(['156,156,156,255', '255,255,255,255']);
    });

    it('trace des traits qui montent vers la droite et se raccordent d’un carreau au suivant', () => {
        const image = noDataPatternImage(2);
        const size = image.width;

        // Le long d'un trait, x + y est constant
        expect(pixel(image, 0, 0)).toEqual(pixel(image, 1, size - 1));
        expect(pixel(image, 3, 0)).toEqual(pixel(image, 0, 3));
        // Chaque ligne et chaque colonne porte la même part de trait : le motif se répète sans raccord visible
        const strokes = (cells: number[][]): number => cells.filter(([r]) => r !== 255).length;
        const row = (y: number): number => strokes(Array.from({ length: size }, (_, x) => pixel(image, x, y)));
        const column = (x: number): number => strokes(Array.from({ length: size }, (_, y) => pixel(image, x, y)));
        expect(new Set([row(0), row(5), row(size - 1), column(0), column(7)]).size).toBe(1);
        expect(row(0)).toBeGreaterThan(0);
        expect(row(0)).toBeLessThan(size / 2);
    });

    it('suit la densité de l’écran', () => {
        expect(noDataPatternImage(1).width).toBe(NO_DATA_HATCH_STEP_PX);
        expect(noDataPatternImage(3).width).toBe(NO_DATA_HATCH_STEP_PX * 3);
    });

    it('donne le motif à la pastille du « sans donnée », et sa couleur à toute autre pastille', () => {
        expect(swatchBackground(NO_DATA_COLOR)).toBe(NO_DATA_CSS_BACKGROUND);
        expect(swatchBackground('#000091')).toBe('#000091');
        expect(NO_DATA_CSS_BACKGROUND).toContain('repeating-linear-gradient(135deg');
    });

    it('a le même pas pour Highcharts', () => {
        expect(NO_DATA_HIGHCHARTS_PATTERN.pattern).toMatchObject({ width: NO_DATA_HATCH_STEP_PX, height: NO_DATA_HATCH_STEP_PX, backgroundColor: '#ffffff' });
    });
});
