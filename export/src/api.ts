import express from 'express';
import { exportToPdf } from './pdf-generator';
import { validateUrlHost } from './url-validation';

const app = express();

const PORT = process.env.PORT;

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/export', async (req, res) => {
    const url = req.query.url as string;

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

    try {
        const pdfBuffer = await exportToPdf(url);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="export-${Date.now()}.pdf"`);
        res.send(pdfBuffer);
    } catch (error: any) {
        console.error('Export failed:', error);
        res.status(500).json({ error: 'PDF generation failed', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Export API running on port ${PORT}`);
    console.log(`GET /api/export?url=https://example.com/page-to-export`);
});
