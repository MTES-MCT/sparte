import express from 'express';
import fs from 'fs';
import path from 'path';
import { exportToPdf } from './pdf-generator';
import { validateUrlHost } from './url-validation';

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const OUTPUT_DIR = '/tmp/exports';

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/export', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        res.status(400).json({ error: 'Missing required parameter: url' });
        return;
    }

    try {
        validateUrlHost(url);
    } catch (error: any) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
    }

    const filename = `export-${Date.now()}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    try {
        await exportToPdf({
            url,
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
    console.log(`POST /api/export with body: { "url": "https://example.com/page-to-export" }`);
});
