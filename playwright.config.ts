import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright des tests end-to-end (dossier `e2e/`).
 *
 * Les tests s'exécutent contre une application déjà lancée (`make start`) :
 * aucun serveur n'est démarré par Playwright. L'URL de base se surcharge avec
 * la variable d'environnement E2E_BASE_URL (défaut : http://localhost:8080).
 */
export default defineConfig({
    testDir: './e2e',
    // Le parcours complet inclut la génération d'un PDF via le serveur d'export.
    timeout: 6 * 60 * 1000,
    expect: { timeout: 15 * 1000 },
    fullyParallel: false,
    workers: 1,
    retries: 0,
    forbidOnly: !!process.env.CI,
    reporter: [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ],
    outputDir: 'test-results',
    use: {
        baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:8080',
        locale: 'fr-FR',
        timezoneId: 'Europe/Paris',
        actionTimeout: 15 * 1000,
        navigationTimeout: 60 * 1000,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off',
        acceptDownloads: true,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
