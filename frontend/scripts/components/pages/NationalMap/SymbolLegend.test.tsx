import React from 'react';
import { render, screen } from '@testing-library/react';
import SymbolLegend from './SymbolLegend';

// Légende des cartes en cercles : les libellés des cercles de référence restent dans le dessin

const drawn = (radii: number[]) => {
    const references = radii.map((radius) => ({ radius, value: radius, label: `${radius} ha` }));
    render(<SymbolLegend indicatorLabel="Consommation" shape="circle" references={references} colors={[{ color: '#6a6af4', label: null }]} note={null} noDataCount={0} method="" />);
    const drawing = screen.getByRole('img');
    return { height: Number(drawing.getAttribute('height')), labels: [...drawing.querySelectorAll('text')].map((text) => Number(text.getAttribute('y'))) };
};

describe('cercles de référence', () => {
    it('garde les libellés de petits cercles dans le dessin, sans les superposer', () => {
        const { height, labels } = drawn([7.5, 4, 3]);

        expect(labels).toEqual([8, 24, 40]);
        expect(Math.max(...labels)).toBeLessThanOrEqual(height - 8);
    });

    it('laisse le libellé d’un grand cercle à la hauteur de son sommet', () => {
        const { labels } = drawn([40, 20, 5]);

        expect(labels).toEqual([8, 48, 78]);
    });
});
