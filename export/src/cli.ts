import path from 'path';
import { exportRapportToPdf } from './pdf-generator';

/**
 * CLI script to export a rapport complet page to PDF using Puppeteer
 *
 * Usage: tsx src/cli.ts <land_type> <land_id> [output_path]
 * Example: tsx src/cli.ts COMM 69123 rapport.pdf
 */

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
    console.error('Usage: tsx src/cli.ts <land_type> <land_id> [output_path]');
    console.error('Example: tsx src/cli.ts COMM 69123 rapport.pdf');
    process.exit(1);
}

const landType = args[0];
const landId = args[1];
const outputPath = args[2] || path.join(__dirname, '..', `rapport-${landType}-${landId}.pdf`);

exportRapportToPdf({
    landType,
    landId,
    outputPath
})
    .then(() => {
        console.log('Export completed successfully');
        process.exit(0);
    })
    .catch((error: Error) => {
        console.error('Export failed:', error);
        process.exit(1);
    });
