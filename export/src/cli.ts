import fs from 'fs';
import path from 'path';
import { exportToPdf } from './pdf-generator';

/**
 * CLI script to export a page to PDF using Puppeteer
 *
 * Usage: tsx src/cli.ts <url> [output_path] [header_url] [footer_url]
 * Example: tsx src/cli.ts "https://example.com/page" rapport.pdf "https://example.com/header" "https://example.com/footer"
 */

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 1) {
    console.error('Usage: tsx src/cli.ts <url> [output_path] [header_url] [footer_url]');
    console.error('Example: tsx src/cli.ts "https://example.com/page" rapport.pdf');
    process.exit(1);
}

const url = args[0];
const outputPath = args[1] || path.join(process.cwd(), `export-${Date.now()}.pdf`);
const headerUrl = args[2];
const footerUrl = args[3];

exportToPdf({ url, headerUrl, footerUrl })
    .then((pdfBuffer) => {
        fs.writeFileSync(outputPath, pdfBuffer);
        console.log(`Export completed successfully: ${outputPath}`);
        process.exit(0);
    })
    .catch((error: Error) => {
        console.error('Export failed:', error);
        process.exit(1);
    });
