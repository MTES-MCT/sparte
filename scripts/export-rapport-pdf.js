const puppeteer = require('puppeteer');
const path = require('path');

/**
 * Export a rapport complet page to PDF using Puppeteer
 *
 * Usage: node scripts/export-rapport-pdf.js <land_type> <land_id> [output_path]
 * Example: node scripts/export-rapport-pdf.js COMM 69123 rapport.pdf
 */

async function exportRapportToPdf(landType, landId, outputPath) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Log console messages and errors from the page
        page.on('console', msg => {
            const type = msg.type();
            if (type === 'error' || type === 'warning') {
                console.log(`[Browser ${type}]:`, msg.text());
            }
        });

        page.on('pageerror', error => {
            console.log('[Browser error]:', error.message);
        });

        // Set viewport to A4 dimensions (in pixels at 96 DPI)
        await page.setViewport({
            width: 794,  // 210mm at 96 DPI
            height: 1123 // 297mm at 96 DPI
        });

        const url = `http://localhost:8080/exports/rapport-complet/${landType}/${landId}`;
        console.log(`Loading page: ${url}`);

        // Navigate to the page and wait for network to be idle
        await page.goto(url, {
            waitUntil: ['networkidle0', 'domcontentloaded'],
            timeout: 90000
        });

        // Wait for the page content to load first
        console.log('Waiting for page content...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Wait for any GenericChart to be present
        console.log('Waiting for charts...');
        try {
            await page.waitForSelector('.highcharts-container', { timeout: 90000 });
            console.log('First chart detected');

            // Wait for all charts to finish loading
            await page.waitForFunction(
                () => {
                    const charts = document.querySelectorAll('.highcharts-container');
                    const loadingSpinners = document.querySelectorAll('.loading-spinner, .spinner');
                    return charts.length > 0 && loadingSpinners.length === 0;
                },
                { timeout: 90000 }
            );
            console.log('All charts loaded');
        } catch (e) {
            console.log('Chart loading timeout or no charts found:', e.message);
        }

        // Additional wait for charts to render completely (Highcharts layout calculations)
        console.log('Final rendering wait...');
        await new Promise(resolve => setTimeout(resolve, 15000));

        console.log('Page loaded, generating PDF...');

        // Generate PDF with A4 format
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
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
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
    console.error('Usage: node scripts/export-rapport-pdf.js <land_type> <land_id> [output_path]');
    console.error('Example: node scripts/export-rapport-pdf.js COMM 69123 rapport.pdf');
    process.exit(1);
}

const landType = args[0];
const landId = args[1];
const outputPath = args[2] || path.join(__dirname, '..', `rapport-${landType}-${landId}.pdf`);

exportRapportToPdf(landType, landId, outputPath)
    .then(() => {
        console.log('Export completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Export failed:', error);
        process.exit(1);
    });
