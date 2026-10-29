import { timingSafeEqual } from 'crypto';

export const TOKEN_HEADER = 'x-export-token';

/**
 * Jeton partagé avec Django (EXPORT_SERVER_TOKEN côté Django, EXPORT_API_TOKEN ici).
 * Sans EXPORT_API_TOKEN, l'API reste ouverte : cela permet de déployer le serveur avant que
 * Django n'envoie le jeton, puis de l'exiger en posant la variable.
 */
export function getExpectedToken(): string {
    return process.env.EXPORT_API_TOKEN?.trim() ?? '';
}

export function isAuthorized(providedToken: string | undefined): boolean {
    const expectedToken = getExpectedToken();
    if (!expectedToken) {
        return true;
    }
    if (!providedToken) {
        return false;
    }
    const provided = Buffer.from(providedToken);
    const expected = Buffer.from(expectedToken);
    // Comparaison à temps constant ; seule la longueur du jeton peut fuiter
    return provided.length === expected.length && timingSafeEqual(provided, expected);
}
