import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GRID_DESTINATIONS } from '../../indicators';
import { lightnessOf } from '../shades';
import { ALL_DESTINATIONS, CLASS_LIGHTNESS, ColoredDestination, DESTINATION_COLORS, destinationPalette } from './consoColors';

const DESTINATIONS = Object.keys(DESTINATION_COLORS) as ColoredDestination[];

// Configuration que lit la page Consommation des diagnostics, dans le code du serveur
const SERVER_CONSTANTS = readFileSync(join(process.cwd(), 'project/charts/constants.py'), 'utf8');

// Constantes de couleur du fichier : `NOM = "#rrggbb"`
const serverConstants = new Map([...SERVER_CONSTANTS.matchAll(/^(\w+) = "(#[0-9a-fA-F]{6})"$/gm)].map(([, name, color]) => [name, color.toLowerCase()]));

// Couleur de chaque destination dans `CARROYAGE_DESTINATION_CONFIG` : `"clé": { … "color": NOM, … }`
const serverColors = (): Record<string, string> => {
    const config = SERVER_CONSTANTS.slice(SERVER_CONSTANTS.indexOf('CARROYAGE_DESTINATION_CONFIG = {'));
    const entries = [...config.matchAll(/"(\w+)": \{[^}]*?"color": (\w+),/g)];
    return Object.fromEntries(entries.map(([, destination, constant]) => [destination, serverConstants.get(constant)]));
};

describe('couleurs des destinations du carroyage', () => {
    it('sont celles de la page Consommation des diagnostics', () => {
        expect(DESTINATION_COLORS).toEqual(serverColors());
    });

    it('couvrent toutes les destinations de la carte, et la carte de toutes les destinations', () => {
        expect(DESTINATIONS.sort()).toEqual([ALL_DESTINATIONS, ...Object.keys(GRID_DESTINATIONS)].sort());
    });
});

describe('couleurs des classes d’une destination', () => {
    it.each(DESTINATIONS)('« %s » : une nuance par classe, à la clarté de la classe', (destination) => {
        const palette = destinationPalette(destination);

        expect(palette).toHaveLength(CLASS_LIGHTNESS.length);
        palette.forEach((color, index) => expect(Math.abs(lightnessOf(color) - CLASS_LIGHTNESS[index])).toBeLessThan(1));
    });

    it('vont du clair au foncé, à écarts réguliers', () => {
        const steps = CLASS_LIGHTNESS.slice(1).map((lightness, index) => CLASS_LIGHTNESS[index] - lightness);

        expect(new Set(steps)).toEqual(new Set([12]));
    });

    it('distinguent les destinations : deux couleurs différentes ne donnent aucune classe commune', () => {
        const distinct = [...new Set(Object.values(DESTINATION_COLORS))];
        const shades = distinct.flatMap((color) => destinationPalette(DESTINATIONS.find((destination) => DESTINATION_COLORS[destination] === color) as ColoredDestination));

        expect(new Set(shades).size).toBe(shades.length);
    });

    it('donne à la carte de l’habitat et à celle de toutes les destinations les mêmes couleurs, comme la page Consommation', () => {
        expect(destinationPalette('habitat')).toEqual(destinationPalette(ALL_DESTINATIONS));
    });

    it('fige les couleurs de l’activité', () => {
        expect(destinationPalette('activite')).toEqual(['#c8e5e4', '#8ac4c1', '#6e9c9a', '#537675', '#3a5251']);
    });
});
