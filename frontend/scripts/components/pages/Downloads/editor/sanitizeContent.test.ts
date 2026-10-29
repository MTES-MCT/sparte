import { sanitizeContent } from './sanitizeContent';

describe('sanitizeContent', () => {
    it("conserve le balisage produit par l'éditeur", () => {
        const html = '<p>Texte <strong>gras</strong> et <em>italique</em></p><ul><li><p>un</p></li></ul><ol><li><p>deux</p></li></ol>';

        expect(sanitizeContent(html)).toBe(html);
    });

    it("supprime les scripts, les gestionnaires d'événements et les liens", () => {
        expect(sanitizeContent('<img src=x onerror=alert(document.domain)>')).toBe('');
        expect(sanitizeContent('<script>alert(1)</script><p>ok</p>')).toBe('<p>ok</p>');
        expect(sanitizeContent('<p onclick="alert(1)">a</p>')).toBe('<p>a</p>');
        expect(sanitizeContent('<a href="javascript:alert(1)">lien</a>')).toBe('lien');
    });
});
