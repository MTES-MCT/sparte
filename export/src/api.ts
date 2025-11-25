import express from 'express';
import fs from 'fs';
import path from 'path';
import { exportRapportToPdf } from './pdf-generator';

const app = express();
const PORT = process.env.PORT;
const OUTPUT_DIR = '/tmp/exports';

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/export/rapport-complet/:landType/:landId', async (req, res) => {
    const { landType, landId } = req.params;

    const filename = `rapport-${landType}-${landId}-${Date.now()}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    try {
        await exportRapportToPdf({
            landType,
            landId,
            outputPath
        });

        res.download(outputPath, filename, () => {
            // Delete temporary file after download
            fs.unlink(outputPath, (err) => {
                if (err) console.error('Failed to delete temp file:', err);
            });
        });
    } catch (error: any) {
        console.error('Export failed:', error);
        res.status(500).json({ error: 'PDF generation failed', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Export API running on port ${PORT}`);
    console.log(`GET /api/export/rapport-complet/COMM/69123`);
});
