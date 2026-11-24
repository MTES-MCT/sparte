import { SOIL_ARTIFICIAL_COLOR, SOIL_NATURAL_COLOR, artificialShare, recolorSoilPixels, recoloredUrl, sourceUrl } from './soilRecolor';

const rgb = (hex: string): number[] => [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
const recolored = (...pixels: number[][]): number[][] => {
    const data = Uint8ClampedArray.from(pixels.flat());
    recolorSoilPixels(data);
    return pixels.map((_, index) => Array.from(data.slice(index * 4, index * 4 + 4)));
};

// Couleurs relevées sur les tuiles de l'IGN
const IGN_ARTIFICIAL = [255, 145, 145, 128];
const IGN_NATURAL = [165, 255, 128, 128];
const IGN_NOTHING = [255, 255, 255, 0];

describe('couleurs de la carte des sols', () => {
    it('reprend le rouge de l’artificialisation des diagnostics', () => {
        expect(SOIL_ARTIFICIAL_COLOR).toBe('#fa4b42');
    });

    it('lit la part artificialisée d’un pixel de l’image de l’IGN', () => {
        expect(artificialShare(255, 145)).toBe(1);
        expect(artificialShare(165, 255)).toBe(0);
        // Un pixel qui moyenne autant de sol artificialisé que non artificialisé
        expect(artificialShare(210, 200)).toBeCloseTo(0.5, 5);
        // Hors de l'étendue des deux couleurs : borné
        expect(artificialShare(255, 0)).toBe(1);
        expect(artificialShare(0, 255)).toBe(0);
    });

    it('rend opaques, dans nos deux couleurs, le sol artificialisé et le sol non artificialisé', () => {
        expect(recolored(IGN_ARTIFICIAL, IGN_NATURAL)).toEqual([
            [...rgb(SOIL_ARTIFICIAL_COLOR), 255],
            [...rgb(SOIL_NATURAL_COLOR), 255],
        ]);
    });

    it('laisse transparent un pixel sans donnée OCS GE, sans toucher à sa couleur', () => {
        expect(recolored(IGN_NOTHING)).toEqual([IGN_NOTHING]);
    });

    it('donne une couleur intermédiaire à un pixel qui mêle les deux natures de sol', () => {
        const [[red, green, blue, alpha]] = recolored([210, 200, 136, 128]);
        const [artificial, natural] = [rgb(SOIL_ARTIFICIAL_COLOR), rgb(SOIL_NATURAL_COLOR)];

        expect([red, green, blue]).toEqual([0, 1, 2].map((channel) => Math.round((artificial[channel] + natural[channel]) / 2)));
        expect(alpha).toBe(255);
    });

    it('garde le fondu d’un bord à demi effacé', () => {
        expect(recolored([255, 145, 145, 40])[0][3]).toBe(80);
    });

    it('fait passer une adresse par le protocole de recoloration, et la retrouve', () => {
        const url = 'https://data.geopf.fr/wmts?SERVICE=WMTS&TILEMATRIX={z}';

        expect(recoloredUrl(url)).toBe('ign-artif://data.geopf.fr/wmts?SERVICE=WMTS&TILEMATRIX={z}');
        expect(sourceUrl(recoloredUrl(url))).toBe(url);
    });
});
