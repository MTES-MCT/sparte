import { describe, it, expect } from 'vitest';
import { isLocalOrPrivateHost, shouldBlockRequest } from './request-filter';

const ALLOWED_HOSTS = ['mondiagartif.beta.gouv.fr', 'django'];

describe('isLocalOrPrivateHost', () => {
    it.each([
        'localhost',
        'app.localhost',
        'metadata.google.internal',
        'printer.local',
        '127.0.0.1',
        '10.20.25.90',
        '172.16.0.1',
        '192.168.1.1',
        '169.254.169.254',
        '100.64.0.1',
        '0.0.0.0',
        '[::1]',
        '[fd00::1]',
        '[fe80::1]',
        '[::ffff:10.0.0.1]',
    ])('should flag %s', (host) => {
        expect(isLocalOrPrivateHost(host)).toBe(true);
    });

    it.each(['data.geopf.fr', 's3.fr-par.scw.cloud', '8.8.8.8', '172.32.0.1', '[2001:db8::1]'])(
        'should not flag %s',
        (host) => {
            expect(isLocalOrPrivateHost(host)).toBe(false);
        },
    );
});

describe('shouldBlockRequest', () => {
    it('should allow navigation to an allowed host', () => {
        expect(shouldBlockRequest('https://mondiagartif.beta.gouv.fr/exports/rapport-draft/1', true, ALLOWED_HOSTS)).toBe(false);
    });

    it('should block navigation to any other host, including after a redirect', () => {
        expect(shouldBlockRequest('https://example.com/', true, ALLOWED_HOSTS)).toBe(true);
        expect(shouldBlockRequest('data:text/html,<script>alert(1)</script>', true, ALLOWED_HOSTS)).toBe(true);
        expect(shouldBlockRequest('file:///etc/passwd', true, ALLOWED_HOSTS)).toBe(true);
    });

    it('should allow subresources from public third-party hosts', () => {
        expect(shouldBlockRequest('https://data.geopf.fr/tms/1.0.0/tile.pbf', false, ALLOWED_HOSTS)).toBe(false);
        expect(shouldBlockRequest('data:image/png;base64,AAAA', false, ALLOWED_HOSTS)).toBe(false);
    });

    it('should block subresources targeting local or private addresses', () => {
        expect(shouldBlockRequest('http://169.254.169.254/latest/meta-data/', false, ALLOWED_HOSTS)).toBe(true);
        expect(shouldBlockRequest('http://10.0.0.5:8080/', false, ALLOWED_HOSTS)).toBe(true);
        expect(shouldBlockRequest('http://localhost:3000/', false, ALLOWED_HOSTS)).toBe(true);
        expect(shouldBlockRequest('file:///etc/passwd', false, ALLOWED_HOSTS)).toBe(true);
    });

    it('should allow an explicitly allowed internal host (local development)', () => {
        expect(shouldBlockRequest('http://django:8080/static/bundle.js', false, ALLOWED_HOSTS)).toBe(false);
    });
});
