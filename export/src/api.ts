import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { TOKEN_HEADER, isAuthorized } from './auth';
import { exportToPdf } from './pdf-generator';
import { FOOTER_TEMPLATE_PATH, HEADER_TEMPLATE_PATH, buildTemplateUrl, validateUrlHost } from './url-validation';

const app = express();

const PORT = process.env.PORT;

// Pas de CORS : seul Django appelle ce service, de serveur à serveur.

// Derrière le routeur Scalingo : l'adresse du client est dans X-Forwarded-For
app.set('trust proxy', 1);

// Chaque export lance un navigateur : on limite le débit (le pic réel est d'environ 5 exports par minute)
const exportRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: Number.parseInt(process.env.EXPORT_RATE_LIMIT_PER_MINUTE ?? '', 10) || 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/export', exportRateLimit, async (req, res) => {
    if (!isAuthorized(req.get(TOKEN_HEADER))) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const url = req.query.url as string;

    if (!url) {
        res.status(400).json({ error: 'Missing required parameter: url' });
        return;
    }

    // Les gabarits d'en-tête et de pied de page viennent du site de la page exportée, à des
    // chemins fixes : les paramètres headerUrl et footerUrl éventuellement reçus sont ignorés.
    let headerUrl: string;
    let footerUrl: string;
    try {
        validateUrlHost(url);
        headerUrl = buildTemplateUrl(url, HEADER_TEMPLATE_PATH);
        footerUrl = buildTemplateUrl(url, FOOTER_TEMPLATE_PATH);
    } catch (error: any) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
    }

    try {
        const pdfBuffer = await exportToPdf({ url, headerUrl, footerUrl });

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
    console.log(`GET /api/export?url=https://example.com/page`);
});
