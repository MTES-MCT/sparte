import { LEGEND_BAND_PX, LEGEND_SIDE_PX, LegendPlacement, StageSize, UNMEASURED_STAGE, legendOpenByDefault, legendReservation, resizedStage, stageSizeOf } from './stage';

describe('stageSizeOf', () => {
    it('tient pour grande une carte d’ordinateur, sa légende en bande', () => {
        expect(stageSizeOf(656, 595)).toEqual({ compact: false, legendPlacement: 'band', widthClass: 'wide', symbolFactor: 1, hidden: false });
    });

    it('numérote les territoires d’outre-mer quand la carte a moins de 460 px de large ou de 390 px de haut', () => {
        // Scènes où la légende s'ouvre par-dessus la carte : la carte a toute la scène
        expect(stageSizeOf(439, 600)).toMatchObject({ legendPlacement: 'over', compact: true });
        expect(stageSizeOf(600, 389)).toMatchObject({ legendPlacement: 'over', compact: true });
        expect(stageSizeOf(600, 390)).toMatchObject({ legendPlacement: 'over', compact: false });
    });

    it('compte la largeur de la carte sous la bande de légende, qui lui laisse toujours la hauteur des noms', () => {
        expect(stageSizeOf(459, 800)).toMatchObject({ legendPlacement: 'band', compact: true });
        expect(stageSizeOf(460, 800)).toMatchObject({ legendPlacement: 'band', compact: false });
        expect(stageSizeOf(650, LEGEND_BAND_PX.wide + 390)).toMatchObject({ legendPlacement: 'band', compact: false });
    });

    it('garde ses noms à la carte d’une scène trop basse pour la bande, dont la légende est repliée', () => {
        expect(stageSizeOf(650, LEGEND_BAND_PX.wide + 389)).toMatchObject({ legendPlacement: 'over', compact: false });
    });

    it('compte la largeur de la carte à côté de la colonne de légende', () => {
        expect(stageSizeOf(LEGEND_SIDE_PX + 459, 500)).toMatchObject({ legendPlacement: 'side', compact: true });
        expect(stageSizeOf(LEGEND_SIDE_PX + 460, 500)).toMatchObject({ legendPlacement: 'side', compact: false });
        expect(stageSizeOf(LEGEND_SIDE_PX + 600, 389)).toMatchObject({ legendPlacement: 'side', compact: true });
    });

    it('classe la largeur en trois paliers', () => {
        expect([439, 440, 599, 600].map((width) => stageSizeOf(width, 600).widthClass)).toEqual(['narrow', 'medium', 'medium', 'wide']);
    });

    it('réduit les cercles d’après le plus petit côté, rapporté à 560 px', () => {
        expect(stageSizeOf(1200, 560).symbolFactor).toBe(1);
        expect(stageSizeOf(800, 320).symbolFactor).toBe(0.6);
        expect(stageSizeOf(358, 506).symbolFactor).toBe(0.6);
        expect(stageSizeOf(300, 100).symbolFactor).toBe(0.4);
    });

    it('tient une scène pas encore mesurée pour une grande carte, sa légende en bande', () => {
        expect(UNMEASURED_STAGE).toEqual(stageSizeOf(1200, 1000));
    });
});

describe('placement de la légende', () => {
    const placement = (width: number, height: number): LegendPlacement => stageSizeOf(width, height).legendPlacement;

    it('ouvre la légende par-dessus la carte sur une scène de moins de 440 px de large, pas à 440 px', () => {
        expect(placement(439, 600)).toBe('over');
        expect(placement(440, 600)).toBe('band');
    });

    it('n’accorde la bande que si elle laisse à la carte les 390 px de haut qu’il faut aux noms d’outre-mer', () => {
        expect(placement(496, LEGEND_BAND_PX.medium + 390)).toBe('band');
        expect(placement(496, LEGEND_BAND_PX.medium + 389)).toBe('over');
        expect(placement(650, LEGEND_BAND_PX.wide + 390)).toBe('band');
        expect(placement(650, LEGEND_BAND_PX.wide + 389)).toBe('over');
    });

    it('replie la légende sur une scène basse de largeur moyenne, où la bande prendrait la moitié de la carte', () => {
        // Scènes des fenêtres de 1280 × 600 et de 1280 × 650, colonne de droite à côté de la carte,
        // puis de 981 × 700, colonne de droite sous la carte
        expect([placement(576, 486), placement(576, 536), placement(613, 490)]).toEqual(['over', 'over', 'over']);
        // Scène d'une fenêtre de 1280 × 660
        expect(placement(576, 546)).toBe('band');
    });

    it('préfère la colonne à une légende repliée quand la scène trop basse pour la bande est assez large', () => {
        // Scène d'une fenêtre de 1366 × 625
        expect(placement(662, 511)).toBe('side');
    });

    it('loge la légende dans une colonne sur une scène basse mais large, tant qu’il reste à côté la largeur d’une carte', () => {
        expect(placement(812, 320)).toBe('side');
        expect(placement(LEGEND_SIDE_PX + 440, 320)).toBe('side');
        expect(placement(LEGEND_SIDE_PX + 439, 320)).toBe('over');
    });

    it('retient, entre la bande et la colonne, le placement qui laisse la plus grande carte', () => {
        // Scène d'une fenêtre de 1536 × 730 : 594 px de large à côté de la colonne, 571 sous la bande
        expect(placement(814, 616)).toBe('side');
        // Scène d'une fenêtre de 1440 × 900 : sous la bande, la carte garde toute la largeur
        expect(placement(736, 786)).toBe('band');
    });

    it('bascule de la bande à la colonne dès que la colonne laisse à la carte plus de largeur que la bande', () => {
        // À 600 px de haut, la carte de référence fait 552 px de large sous la bande
        expect(placement(LEGEND_SIDE_PX + 552, 600)).toBe('band');
        expect(placement(LEGEND_SIDE_PX + 553, 600)).toBe('side');
    });

    it('garde la bande à une grande scène, où la carte ne gagnerait rien à céder une colonne', () => {
        // Scène d'une fenêtre de 1920 × 1080
        expect(placement(1136, 966)).toBe('band');
    });
});

describe('resizedStage', () => {
    const phone = stageSizeOf(358, 506);

    it('suit la nouvelle taille du cadre', () => {
        expect(resizedStage(stageSizeOf(656, 595), 358, 506)).toEqual(phone);
    });

    it('rend la scène reçue quand la nouvelle taille n’y change rien', () => {
        const desktop = stageSizeOf(656, 595);

        expect(resizedStage(desktop, 700, 620)).toBe(desktop);
    });

    it('tient pour masquée la carte d’un cadre sans largeur, et lui garde sa dernière taille visible', () => {
        expect(resizedStage(phone, 0, 0)).toEqual({ ...phone, hidden: true });
    });

    it('rend la scène reçue tant que la carte reste masquée', () => {
        const hidden = resizedStage(phone, 0, 0);

        expect(resizedStage(hidden, 0, 0)).toBe(hidden);
    });

    it('rend la carte visible, à sa nouvelle taille, quand le cadre retrouve une largeur', () => {
        const hidden = resizedStage(phone, 0, 0);

        expect(resizedStage(hidden, 358, 506)).toEqual(phone);
        expect(resizedStage(hidden, 812, 320)).toEqual(stageSizeOf(812, 320));
    });
});

// Scènes relevées à l'écran : ordinateur à 1440 × 900, à 1280 × 800, téléphone, fenêtre
// d'ordinateur basse, puis fenêtre basse et large (1536 × 730) et téléphone en paysage
const wide = stageSizeOf(736, 786);
const medium = stageSizeOf(576, 686);
const narrow = stageSizeOf(358, 394);
const mediumLow = stageSizeOf(496, 352);
const wideShort = stageSizeOf(814, 616);
const wideLow = stageSizeOf(812, 320);

const NOTHING = { top: 0, left: 0 };

describe('legendOpenByDefault', () => {
    it('ouvre la légende quand la scène lui réserve une bande ou une colonne', () => {
        expect([wide, medium, wideShort, wideLow, UNMEASURED_STAGE].map(legendOpenByDefault)).toEqual([true, true, true, true, true]);
    });

    it('la replie quand elle s’ouvrirait par-dessus la carte, qu’elle masquerait', () => {
        expect([narrow, mediumLow].map(legendOpenByDefault)).toEqual([false, false]);
    });
});

describe('legendReservation', () => {
    it('réserve en haut de la scène une bande, plus haute sur une carte de largeur moyenne', () => {
        expect(legendReservation(wide, true)).toEqual({ top: LEGEND_BAND_PX.wide, left: 0 });
        expect(legendReservation(medium, true)).toEqual({ top: LEGEND_BAND_PX.medium, left: 0 });
        expect(LEGEND_BAND_PX.wide).toBeGreaterThan(0);
        expect(LEGEND_BAND_PX.medium).toBeGreaterThan(LEGEND_BAND_PX.wide);
    });

    it('réserve à gauche de la scène une colonne de largeur fixe, sur toute la hauteur', () => {
        expect(legendReservation(wideShort, true)).toEqual({ top: 0, left: LEGEND_SIDE_PX });
        expect(legendReservation(wideLow, true)).toEqual({ top: 0, left: LEGEND_SIDE_PX });
        expect(LEGEND_SIDE_PX).toBeGreaterThan(0);
    });

    it('ne réserve rien à une légende qui s’ouvre par-dessus la carte', () => {
        expect([narrow, mediumLow].map((stage) => legendReservation(stage, true))).toEqual([NOTHING, NOTHING]);
    });

    it('ne réserve rien pour une légende repliée, quel que soit son placement', () => {
        expect([wide, medium, narrow, wideShort, wideLow].map((stage) => legendReservation(stage, false))).toEqual([NOTHING, NOTHING, NOTHING, NOTHING, NOTHING]);
    });

    it('réserve une bande à la scène pas encore mesurée', () => {
        expect(legendReservation(UNMEASURED_STAGE, true)).toEqual({ top: LEGEND_BAND_PX.wide, left: 0 });
    });

    it('ne dépend que du placement décidé par la scène et de son palier de largeur', () => {
        const sameBand: StageSize = { compact: true, legendPlacement: 'band', widthClass: 'wide', symbolFactor: 0.4, hidden: false };

        expect(legendReservation(sameBand, true)).toEqual(legendReservation(wide, true));
        // Rien de la légende n'entre dans le calcul, ni son contenu ni sa nature : la scène et l'état replié
        expect(legendReservation).toHaveLength(2);
    });
});
