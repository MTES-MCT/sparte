import puppeteer, { Browser, Page } from 'puppeteer';

interface ExportOptions {
    url: string;
    headerUrl: string;
    footerUrl: string;
}

async function fetchTemplate(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch template from ${url}: ${response.statusText}`);
    }
    return response.text();
}

/**
 * Export a page to PDF using Puppeteer
 * @returns PDF content as a Buffer
 */
export async function exportToPdf(options: ExportOptions): Promise<Buffer> {
    const { url, headerUrl, footerUrl } = options;

    console.log(`Launching browser to export: ${url}`);

    const [headerTemplate, footerTemplate, browser] = await Promise.all([
        fetchTemplate(headerUrl),
        fetchTemplate(footerUrl),
        puppeteer.launch({
            // @ts-ignore
            headless: "new",
            pipe: true,
            waitForInitialPage: false,
            args: ['--no-sandbox'],
            defaultViewport: {
                width: 794,
                height: 1123
            },
        })
    ]);

    console.log(`Browser launched`);

    try {
        const page: Page = await browser.newPage();

        console.log(`Loading page: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle2',
        });

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
