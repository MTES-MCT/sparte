import type { MapTip } from '../../domain/tip';
import { TIP_CLASS, tipMarkup } from './tipView';

const TIP: MapTip = { title: 'Indre', swatch: '#6a6af4', measures: [{ label: '', value: '0,32 %' }], context: 'de 2011 à 2024' };

// Le gabarit lu comme le navigateur le lira
const rendered = (tip: MapTip, hint?: string): HTMLElement => {
    const host = document.createElement('div');
    host.innerHTML = tipMarkup(tip, hint);
    return host.firstElementChild as HTMLElement;
};
const texts = (element: HTMLElement, part: string): string[] => [...element.querySelectorAll(`.${TIP_CLASS}__${part}`)].map((node) => node.textContent);

describe('tipMarkup', () => {
    it('écrit le nom, puis la valeur, puis le contexte', () => {
        const element = rendered(TIP);

        expect([...element.children].map((child) => child.className)).toEqual([`${TIP_CLASS}__title`, `${TIP_CLASS}__value`, `${TIP_CLASS}__context`]);
        expect(element.textContent).toBe('Indre0,32 %de 2011 à 2024');
    });

    it('précède le nom de la pastille de sa classe, et s’en passe sans couleur', () => {
        const swatch = rendered(TIP).querySelector<HTMLElement>(`.${TIP_CLASS}__swatch`);

        expect(swatch.style.backgroundColor).toBe('rgb(106, 106, 244)');
        expect(rendered({ ...TIP, swatch: null }).querySelector(`.${TIP_CLASS}__swatch`)).toBeNull();
    });

    it('nomme chacune des mesures d’une carte qui en croise deux', () => {
        const element = rendered({
            ...TIP,
            measures: [
                { label: 'Consommation annuelle', value: '0,015 % par an' },
                { label: 'Évolution des ménages', value: '-0,02 % par an' },
            ],
            context: '',
        });

        expect(texts(element, 'label')).toEqual(['Consommation annuelle', 'Évolution des ménages']);
        expect(texts(element, 'value')).toEqual(['0,015 % par an', '-0,02 % par an']);
        expect(texts(element, 'context')).toEqual([]);
    });

    it('se réduit au nom pour un élément dont la carte ne dit rien', () => {
        expect(rendered({ title: 'Loir-et-Cher', swatch: null, measures: [], context: '' }).children).toHaveLength(1);
    });

    it('termine par ce que fait un clic, quand il est donné', () => {
        expect(texts(rendered(TIP, 'Cliquer pour ouvrir ce territoire'), 'hint')).toEqual(['Cliquer pour ouvrir ce territoire']);
        expect(texts(rendered(TIP), 'hint')).toEqual([]);
    });

    it('écrit les noms et les phrases comme du texte, jamais comme du HTML', () => {
        const element = rendered({ title: '<img src=x onerror=alert(1)>', swatch: '"><script>', measures: [{ label: '', value: '<b>1</b>' }], context: 'a & b' });

        expect(element.querySelector('img, script, b')).toBeNull();
        expect(texts(element, 'title')).toEqual(['<img src=x onerror=alert(1)>']);
        expect(texts(element, 'value')).toEqual(['<b>1</b>']);
        expect(texts(element, 'context')).toEqual(['a & b']);
    });
});
