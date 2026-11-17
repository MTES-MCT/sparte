import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { MapTip } from '../../domain/tip';
import TipSheet from './TipSheet';

const TIP: MapTip = { title: 'Indre', swatch: '#6a6af4', measures: [{ label: '', value: '0,32 %' }], context: 'de 2011 à 2024' };
const sheet = (): HTMLElement => screen.getByRole('region', { name: 'Élément désigné sur la carte' });

describe('fiche de lecture', () => {
    it('dit le nom, la valeur et le contexte de l’élément, dans le gabarit de l’infobulle', () => {
        render(<TipSheet tip={TIP} action={null} onClose={jest.fn()} />);

        expect(sheet()).toHaveTextContent('Indre');
        expect(sheet()).toHaveTextContent('0,32 %');
        expect(sheet()).toHaveTextContent('de 2011 à 2024');
    });

    it('porte le bouton qui ouvre le territoire, quand il peut l’être', () => {
        const onClick = jest.fn();
        render(<TipSheet tip={TIP} action={{ label: 'Ouvrir ce territoire', onClick }} onClose={jest.fn()} />);

        fireEvent.click(within(sheet()).getByRole('button', { name: 'Ouvrir ce territoire' }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('ne propose que de la fermer pour un élément qui ne s’ouvre pas', () => {
        render(<TipSheet tip={TIP} action={null} onClose={jest.fn()} />);

        expect(within(sheet()).getAllByRole('button')).toHaveLength(1);
    });

    it.each([
        ['son bouton', () => fireEvent.click(within(sheet()).getByRole('button', { name: /Fermer/ }))],
        ['la touche Échap', () => fireEvent.keyDown(document, { key: 'Escape' })],
    ])('se ferme par %s', (_way, close) => {
        const onClose = jest.fn();
        render(<TipSheet tip={TIP} action={null} onClose={onClose} />);

        close();

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('est rendue dans l’emplacement que la page lui réserve, que les lecteurs d’écran écoutent', () => {
        const slot = document.body.appendChild(document.createElement('div'));
        slot.setAttribute('aria-live', 'polite');
        const { container, unmount } = render(<TipSheet slot={slot} tip={TIP} action={null} onClose={jest.fn()} />);

        expect(container).toBeEmptyDOMElement();
        expect(slot).toContainElement(sheet());

        unmount();
        expect(slot).toBeEmptyDOMElement();
        slot.remove();
    });
});
