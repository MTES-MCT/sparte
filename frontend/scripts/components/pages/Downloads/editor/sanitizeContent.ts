import DOMPurify from 'dompurify';

// Balises produites par l'éditeur : le contenu rendu dans l'export public ne garde rien d'autre
const ALLOWED_TAGS = ['p', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'br'];

export const sanitizeContent = (content: string): string =>
    DOMPurify.sanitize(content, { ALLOWED_TAGS, ALLOWED_ATTR: [] });
