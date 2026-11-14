import { describe, it, expect, afterEach } from 'vitest';
import { isAuthorized } from './auth';

describe('isAuthorized', () => {
    const originalEnv = process.env.EXPORT_API_TOKEN;

    afterEach(() => {
        if (originalEnv === undefined) {
            delete process.env.EXPORT_API_TOKEN;
        } else {
            process.env.EXPORT_API_TOKEN = originalEnv;
        }
    });

    it('should accept every request when EXPORT_API_TOKEN is not set', () => {
        delete process.env.EXPORT_API_TOKEN;
        expect(isAuthorized(undefined)).toBe(true);
    });

    it('should require the configured token', () => {
        process.env.EXPORT_API_TOKEN = 'secret-token';
        expect(isAuthorized('secret-token')).toBe(true);
        expect(isAuthorized('wrong-token')).toBe(false);
        expect(isAuthorized('')).toBe(false);
        expect(isAuthorized(undefined)).toBe(false);
    });
});
