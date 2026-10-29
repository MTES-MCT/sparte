import { isIP } from 'node:net';

/**
 * Filtre des requêtes émises par le navigateur pendant un export.
 *
 * - Une navigation (page principale, iframe, redirection) ne peut viser qu'un hôte autorisé :
 *   une redirection ouverte sur un hôte autorisé ne permet pas de charger une page tierce.
 * - Aucune requête ne peut viser une adresse locale ou privée (SSRF vers le réseau interne),
 *   sauf un hôte explicitement autorisé (ex. `django` en local).
 */

const LOCAL_HOSTNAMES = new Set(['localhost']);
const LOCAL_SUFFIXES = ['.localhost', '.local', '.internal'];

function isPrivateIPv4(ip: string): boolean {
    const [a, b] = ip.split('.').map(Number);
    return (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168)
    );
}

function isPrivateIPv6(ip: string): boolean {
    const normalized = ip.toLowerCase();
    if (normalized === '::' || normalized === '::1') {
        return true;
    }
    const mappedIPv4 = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(normalized);
    if (mappedIPv4) {
        return isPrivateIPv4(mappedIPv4[1]);
    }
    // fc00::/7 (adresses uniques locales) et fe80::/10 (lien local)
    return /^f[cd]/.test(normalized) || /^fe[89ab]/.test(normalized);
}

export function isLocalOrPrivateHost(hostname: string): boolean {
    const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
    if (LOCAL_HOSTNAMES.has(host) || LOCAL_SUFFIXES.some(suffix => host.endsWith(suffix))) {
        return true;
    }
    const version = isIP(host);
    if (version === 4) {
        return isPrivateIPv4(host);
    }
    if (version === 6) {
        return isPrivateIPv6(host);
    }
    return false;
}

export function shouldBlockRequest(url: string, isNavigation: boolean, allowedHosts: string[]): boolean {
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch {
        return true;
    }

    if (parsedUrl.protocol === 'data:' || parsedUrl.protocol === 'blob:') {
        // Ressources embarquées (images, polices, workers) : jamais une navigation
        return isNavigation;
    }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return true;
    }

    const isAllowedHost = allowedHosts.includes(parsedUrl.hostname);
    if (isNavigation) {
        return !isAllowedHost;
    }
    return !isAllowedHost && isLocalOrPrivateHost(parsedUrl.hostname);
}
