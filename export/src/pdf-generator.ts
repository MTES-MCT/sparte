import puppeteer, { Page } from 'puppeteer';
import { shouldBlockRequest } from './request-filter';
import { getAllowedHosts } from './url-validation';

interface ExportOptions {
    url: string;
    headerUrl: string;
    footerUrl: string;
    // Hôtes que le navigateur peut ouvrir (par défaut ALLOWED_HOSTS)
    allowedHosts?: string[];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchTemplate(url: string): Promise<string> {
    console.log(`Fetching template from: ${url}`);
    // Pas de redirection : l'URL a été validée, sa cible ne doit pas pouvoir changer
    const response = await fetch(url, { redirect: 'error' });
    if (!response.ok) {
        throw new Error(`Failed to fetch template from ${url}: ${response.statusText}`);
    }
    console.log(`Template fetched successfully from: ${url}`);
    return response.text();
}

/**
 * Export a page to PDF using Puppeteer
 * @returns PDF content as a Buffer
 */
export async function exportToPdf(options: ExportOptions): Promise<Buffer> {
    const { url, headerUrl, footerUrl } = options;
    const allowedHosts = options.allowedHosts ?? getAllowedHosts();

    console.log(`Launching browser to export: ${url}`);

    const [headerTemplate, footerTemplate, browser] = await Promise.all([
        fetchTemplate(headerUrl),
        fetchTemplate(footerUrl),
        puppeteer.launch({
            // @ts-ignore
            headless: "new",
            pipe: true,
            // La politique de même origine et la vérification des certificats restent actives :
            // un script de la page ne peut pas lire les réponses d'un autre domaine.
            // Pas de bac à sable : indisponible dans les conteneurs Scalingo et Docker.
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            defaultViewport: {
                width: 794,
                height: 1123
            },
        })
    ]);

    console.log(`Browser launched`);

    try {
        const page: Page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (shouldBlockRequest(request.url(), request.isNavigationRequest(), allowedHosts)) {
                console.warn(`Blocked request: ${request.url()}`);
                request.abort('blockedbyclient');
                return;
            }
            request.continue();
        });

        console.log(`Loading page: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle0',
        });

        // wait 500ms to ensure all resources are loaded
        console.log('Waiting for page to stabilize...');
        await delay(5000);


        console.log('Generating PDF...');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            timeout: 120000,
            headerTemplate,
            footerTemplate,
            margin: {
                top: '20mm',
                bottom: '20mm',
            }
        });

        console.log('PDF generated successfully');
        return Buffer.from(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    } finally {
        await browser.close();
    }
}
