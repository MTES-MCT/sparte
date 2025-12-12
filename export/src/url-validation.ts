/**
 * Get the list of allowed hosts from ALLOWED_HOSTS environment variable
 * Format: comma-separated list of hostnames (e.g., "localhost,example.com,app.example.com")
 */
export function getAllowedHosts(): string[] {
    const allowedHosts = process.env.ALLOWED_HOSTS;
    if (!allowedHosts) {
        return [];
    }
    return allowedHosts.split(',').map(host => host.trim()).filter(Boolean);
}

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Validate that the URL's host is in the allowed hosts list
 * @throws Error if the host is not allowed
 */
export function validateUrlHost(url: string): void {
    const allowedHosts = getAllowedHosts();

    // If no allowed hosts configured, reject all requests for security
    if (allowedHosts.length === 0) {
        throw new Error('ALLOWED_HOSTS environment variable is not configured. Please set it to a comma-separated list of allowed hostnames.');
    }

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch {
        throw new Error(`Invalid URL: ${url}`);
    }

    // Validate protocol
    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
        throw new Error(`Protocol "${parsedUrl.protocol}" is not allowed. Only http: and https: are permitted.`);
    }

    const hostname = parsedUrl.hostname;

    if (!allowedHosts.includes(hostname)) {
        throw new Error(`Host "${hostname}" is not in the allowed hosts list. Allowed hosts: ${allowedHosts.join(', ')}`);
    }
}
