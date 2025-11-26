import puppeteer, { Browser, Page } from 'puppeteer';

export interface ExportOptions {
    url: string;
    outputPath: string;
}

/**
 * Export a page to PDF using Puppeteer
 */
export async function exportToPdf(options: ExportOptions): Promise<string> {
    const { url, outputPath } = options;

    console.log(`Launching browser to export: ${url}`);
    const browser: Browser = await puppeteer.launch({
        // @ts-ignore
        headless: "new",
        args: ['--no-sandbox'],
        defaultViewport: {
            width: 794,
            height: 1123
        },
    });
    console.log(`Browser launched`);

    try {
        const page: Page = await browser.newPage();

        console.log(`Loading page: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 60000,
        });

        console.log('Generating PDF...');
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            timeout: 120000, // 2 minutes timeout for PDF generation
            headerTemplate: `
                <div style="width: 100%; font-size: 9px; padding: 5mm 20mm 3mm 20mm; margin: 0; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #000091; font-weight: 600; font-size: 10px;">Mon Diagnostic Artificialisation</span>
                    <span style="color: #666; font-size: 9px;">Diagnostic territorial de sobriété foncière</span>
                </div>
            `,
            footerTemplate: `
                <div style="width: 100%; font-size: 9px; padding: 3mm 20mm 5mm 20mm; margin: 0; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #666; font-size: 9px;">
                        <span class="date"></span>
                    </span>
                    <span style="color: #000091; font-weight: 600; font-size: 9px;">
                        Page <span class="pageNumber"></span> / <span class="totalPages"></span>
                    </span>
                </div>
            `,
            margin: {
                top: '20mm',
                bottom: '20mm',
            }
        });

        console.log(`PDF generated successfully: ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    } finally {
        await browser.close();
    }
}
