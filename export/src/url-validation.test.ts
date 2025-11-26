import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateUrlHost, getAllowedHosts } from './url-validation';

describe('getAllowedHosts', () => {
    const originalEnv = process.env.ALLOWED_HOSTS;

    afterEach(() => {
        if (originalEnv === undefined) {
            delete process.env.ALLOWED_HOSTS;
        } else {
            process.env.ALLOWED_HOSTS = originalEnv;
        }
    });

    it('should return empty array when ALLOWED_HOSTS is not set', () => {
        delete process.env.ALLOWED_HOSTS;
        expect(getAllowedHosts()).toEqual([]);
    });

    it('should return empty array when ALLOWED_HOSTS is empty string', () => {
        process.env.ALLOWED_HOSTS = '';
        expect(getAllowedHosts()).toEqual([]);
    });

    it('should parse single host', () => {
        process.env.ALLOWED_HOSTS = 'example.com';
        expect(getAllowedHosts()).toEqual(['example.com']);
    });

    it('should parse multiple hosts', () => {
        process.env.ALLOWED_HOSTS = 'localhost,example.com,api.example.com';
        expect(getAllowedHosts()).toEqual(['localhost', 'example.com', 'api.example.com']);
    });

    it('should trim whitespace around hosts', () => {
        process.env.ALLOWED_HOSTS = ' localhost , example.com , api.example.com ';
        expect(getAllowedHosts()).toEqual(['localhost', 'example.com', 'api.example.com']);
    });

    it('should filter empty entries', () => {
        process.env.ALLOWED_HOSTS = 'localhost,,example.com,';
        expect(getAllowedHosts()).toEqual(['localhost', 'example.com']);
    });
});

describe('validateUrlHost', () => {
    const originalEnv = process.env.ALLOWED_HOSTS;

    afterEach(() => {
        if (originalEnv === undefined) {
            delete process.env.ALLOWED_HOSTS;
        } else {
            process.env.ALLOWED_HOSTS = originalEnv;
        }
    });

    describe('when ALLOWED_HOSTS is not configured', () => {
        beforeEach(() => {
            delete process.env.ALLOWED_HOSTS;
        });

        it('should throw error when ALLOWED_HOSTS is not set', () => {
            expect(() => validateUrlHost('https://example.com/page')).toThrow(
                'ALLOWED_HOSTS environment variable is not configured'
            );
        });
    });

    describe('when ALLOWED_HOSTS is configured', () => {
        beforeEach(() => {
            process.env.ALLOWED_HOSTS = 'localhost,example.com,api.example.com';
        });

        it('should not throw for allowed host', () => {
            expect(() => validateUrlHost('https://example.com/page')).not.toThrow();
        });

        it('should not throw for allowed host with port', () => {
            expect(() => validateUrlHost('http://localhost:8080/page')).not.toThrow();
        });

        it('should not throw for allowed host with path and query', () => {
            expect(() => validateUrlHost('https://example.com/path/to/page?query=value')).not.toThrow();
        });

        it('should throw for host not in allowed list', () => {
            expect(() => validateUrlHost('https://malicious.com/page')).toThrow(
                'Host "malicious.com" is not in the allowed hosts list'
            );
        });

        it('should throw for subdomain not explicitly allowed', () => {
            expect(() => validateUrlHost('https://sub.example.com/page')).toThrow(
                'Host "sub.example.com" is not in the allowed hosts list'
            );
        });

        it('should throw for invalid URL', () => {
            expect(() => validateUrlHost('not-a-valid-url')).toThrow('Invalid URL: not-a-valid-url');
        });

        it('should throw for empty URL', () => {
            expect(() => validateUrlHost('')).toThrow('Invalid URL: ');
        });

        it('should include allowed hosts in error message', () => {
            expect(() => validateUrlHost('https://evil.com/page')).toThrow(
                'Allowed hosts: localhost, example.com, api.example.com'
            );
        });
    });

    describe('edge cases', () => {
        it('should handle URL with authentication', () => {
            process.env.ALLOWED_HOSTS = 'example.com';
            expect(() => validateUrlHost('https://user:pass@example.com/page')).not.toThrow();
        });

        it('should handle URL with fragment', () => {
            process.env.ALLOWED_HOSTS = 'example.com';
            expect(() => validateUrlHost('https://example.com/page#section')).not.toThrow();
        });

        it('should handle IP address as host', () => {
            process.env.ALLOWED_HOSTS = '127.0.0.1,192.168.1.1';
            expect(() => validateUrlHost('http://127.0.0.1:3000/page')).not.toThrow();
            expect(() => validateUrlHost('http://192.168.1.1/page')).not.toThrow();
            expect(() => validateUrlHost('http://10.0.0.1/page')).toThrow();
        });

        it('should be case-sensitive for hostnames', () => {
            process.env.ALLOWED_HOSTS = 'Example.com';
            // URL hostname is normalized to lowercase
            expect(() => validateUrlHost('https://example.com/page')).toThrow();
            expect(() => validateUrlHost('https://Example.com/page')).toThrow();
        });
    });

    describe('protocol validation', () => {
        beforeEach(() => {
            process.env.ALLOWED_HOSTS = 'localhost,example.com';
        });

        it('should allow http protocol', () => {
            expect(() => validateUrlHost('http://example.com/page')).not.toThrow();
        });

        it('should allow https protocol', () => {
            expect(() => validateUrlHost('https://example.com/page')).not.toThrow();
        });

        it('should reject file protocol', () => {
            expect(() => validateUrlHost('file://localhost/etc/passwd')).toThrow(
                'Protocol "file:" is not allowed. Only http: and https: are permitted.'
            );
        });

        it('should reject javascript protocol', () => {
            expect(() => validateUrlHost('javascript://example.com/alert(1)')).toThrow(
                'Protocol "javascript:" is not allowed'
            );
        });

        it('should reject ftp protocol', () => {
            expect(() => validateUrlHost('ftp://example.com/file.txt')).toThrow(
                'Protocol "ftp:" is not allowed'
            );
        });

        it('should reject data protocol', () => {
            expect(() => validateUrlHost('data:text/html,<script>alert(1)</script>')).toThrow(
                'Protocol "data:" is not allowed'
            );
        });
    });
});
