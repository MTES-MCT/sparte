import { promises as fs } from 'fs';
import { expect, test, type Page } from '@playwright/test';

/**
 * Parcours complet d'un nouvel utilisateur :
 *   inscription → complétion du profil → déconnexion / reconnexion →
 *   recherche d'un territoire → diagnostic → création d'un rapport → export PDF.
 *
 * Pré-requis : l'application tourne (`make start`), avec le serveur d'export
 * (conteneur export-server) qui génère les PDF. Le test crée un utilisateur
 * jetable `e2e-<horodatage>@example.com` dans la base locale.
 */

const horodatage = Date.now();

const utilisateur = {
    prenom: 'Test',
    nom: 'Playwright',
    email: `e2e-${horodatage}@example.com`,
    // Règles du formulaire : 12 caractères minimum, 1 chiffre, 1 caractère spécial,
    // pas trop proche de l'e-mail (validateurs Django).
    motDePasse: 'Diag-Artif!2026-e2e',
};

const territoire = {
    recherche: process.env.E2E_TERRITOIRE_RECHERCHE ?? 'Lyon',
    codeInsee: process.env.E2E_TERRITOIRE_CODE_INSEE ?? '69123',
    urlDiagnostic: process.env.E2E_TERRITOIRE_URL ?? '/diagnostic/commune/69123-lyon',
};

const nomDuRapport = `Rapport e2e ${horodatage}`;

// Le formulaire d'inscription porte un jeton anti-spam qui n'est accepté
// qu'au moins 3 secondes après la génération de la page (utils/antispam.py).
const DELAI_ANTISPAM_MS = 3500;

// La génération du PDF passe par le serveur d'export (Puppeteer) ; Django
// abandonne après 200 s, on attend donc un peu plus longtemps que lui.
const DELAI_GENERATION_PDF_MS = 240 * 1000;

const barreDeRecherche = (page: Page, conteneur?: string) => {
    const racine = conteneur ? page.locator(conteneur) : page;
    return racine.getByRole('textbox', { name: 'Rechercher un territoire' });
};

const resultatDeRecherche = (page: Page, conteneur?: string) => {
    const racine = conteneur ? page.locator(conteneur) : page;
    return racine.getByText(`Code INSEE: ${territoire.codeInsee}`, { exact: true });
};

test.describe('Parcours utilisateur : du compte au rapport téléchargeable', () => {
    test('un nouvel utilisateur crée son compte, ouvre un diagnostic et génère un rapport PDF', async ({ page }) => {
        await test.step("Créer un compte depuis le formulaire d'inscription", async () => {
            await page.goto('/users/signup/');
            await expect(page).toHaveTitle(/Inscription/);

            await page.locator('input[name="first_name"]').fill(utilisateur.prenom);
            await page.locator('input[name="last_name"]').fill(utilisateur.nom);
            await page.locator('input[name="email"]').fill(utilisateur.email);
            await page.locator('input[name="password1"]').fill(utilisateur.motDePasse);
            await page.locator('input[name="password2"]').fill(utilisateur.motDePasse);
            await page.locator('input[name="accept_privacy"]').check();

            await page.waitForTimeout(DELAI_ANTISPAM_MS);
            await page.getByRole('button', { name: "S'inscrire" }).click();

            // L'inscription connecte l'utilisateur ; le middleware le renvoie
            // vers la complétion de profil tant que celui-ci est incomplet.
            await expect(page).toHaveURL(/\/users\/complete-profile\//);
        });

        await test.step('Compléter le profil (organisme et territoire principal)', async () => {
            await page.locator('select[name="organism"]').selectOption('ACTEURS_CITOYENS');

            await barreDeRecherche(page).fill(territoire.recherche);
            await resultatDeRecherche(page).click();
            await expect(page.getByText(`Code : ${territoire.codeInsee}`)).toBeVisible();

            await page.getByRole('button', { name: 'Finaliser mon inscription' }).click();
            // Sans paramètre `next`, l'inscription renvoie vers la page d'accueil.
            await expect(page).toHaveURL((url) => url.pathname === '/');
        });

        await test.step('Se déconnecter puis se reconnecter avec ses identifiants', async () => {
            await page.goto('/users/signout/');
            await expect(page).toHaveURL(/\/users\/signin\//);

            await page.locator('input[name="username"]').fill(utilisateur.email);
            await page.locator('input[name="password"]').fill(utilisateur.motDePasse);
            await page.getByRole('button', { name: 'Se connecter' }).click();

            await expect(page).toHaveURL(/\/diagnostic\/mes-territoires/);
            // Le menu « Mon compte » n'apparaît dans l'en-tête que pour un utilisateur connecté.
            await expect(page.getByRole('button', { name: 'Mon compte' })).toBeVisible();

            const moi = await page.request.get('/api/me/');
            expect(moi.ok()).toBeTruthy();
            expect(await moi.json()).toMatchObject({ is_authenticated: true, email: utilisateur.email });
        });

        await test.step("Rechercher un territoire depuis la page d'accueil", async () => {
            await page.goto('/');
            await barreDeRecherche(page, '#react-search-bar').fill(territoire.recherche);
            await resultatDeRecherche(page, '#react-search-bar').click();
        });

        await test.step('Ouvrir le diagnostic du territoire', async () => {
            await expect(page).toHaveURL(new RegExp(`${territoire.urlDiagnostic}/?$`));
            await expect(page).toHaveTitle(new RegExp(`\\(${territoire.codeInsee}\\)`));
            await expect(page.getByRole('link', { name: 'Générer un rapport' })).toBeVisible();
        });

        await test.step('Créer un rapport complet depuis la page Téléchargements', async () => {
            await page.getByRole('link', { name: 'Générer un rapport' }).click();
            await expect(page).toHaveURL(new RegExp(`${territoire.urlDiagnostic}/telechargements$`));

            await page.getByRole('button', { name: 'Rapport Complet' }).click();

            const modale = page.getByRole('dialog', { name: 'Créer un nouveau rapport' });
            await expect(modale).toBeVisible();
            await modale.getByLabel('Nom du rapport').fill(nomDuRapport);
            await modale.getByRole('button', { name: 'Créer le rapport' }).click();

            // Le brouillon est créé côté API puis ouvert dans l'éditeur.
            await expect(page).toHaveURL(new RegExp(`${territoire.urlDiagnostic}/telechargements/[0-9a-f-]{36}$`));
            await expect(page.getByRole('button', { name: nomDuRapport })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Télécharger', exact: true })).toBeEnabled();
        });

        await test.step('Générer le PDF et vérifier qu\'il est proposé au téléchargement', async () => {
            const attenteDemarrage = page.waitForResponse(
                (reponse) => reponse.url().includes('/diagnostic/export/start/') && reponse.request().method() === 'POST',
            );
            const attenteTelechargement = page
                .waitForEvent('download', { timeout: DELAI_GENERATION_PDF_MS })
                .catch((): null => null);

            await page.getByRole('button', { name: 'Télécharger', exact: true }).click();

            // 1. La demande d'export est acceptée et un job est créé.
            const demarrage = await attenteDemarrage;
            expect(demarrage.status(), await demarrage.text()).toBe(200);
            const { jobId } = (await demarrage.json()) as { jobId: string };
            expect(jobId).toMatch(/^[0-9a-f-]{36}$/);
            await expect(page.getByRole('button', { name: 'Génération...' })).toBeVisible();

            // 2. Le polling du statut se termine (completed ou failed).
            const reponseFinale = await page.waitForResponse(
                async (reponse): Promise<boolean> => {
                    if (!reponse.url().includes(`/diagnostic/export/status/${jobId}/`)) return false;
                    if (reponse.status() !== 200) return true;
                    const corps = (await reponse.json()) as { status: string };
                    return corps.status !== 'pending';
                },
                { timeout: DELAI_GENERATION_PDF_MS },
            );
            const statutFinal = (await reponseFinale.json()) as { status: string; error?: string };
            expect(statutFinal, `Génération du PDF en échec : ${statutFinal.error ?? 'sans détail'}`).toMatchObject({
                status: 'completed',
            });

            // 3. Le PDF est servi puis proposé au téléchargement par le navigateur.
            const telechargement = await attenteTelechargement;
            expect(telechargement, 'Aucun téléchargement déclenché après la fin de la génération').not.toBeNull();
            expect(telechargement!.suggestedFilename()).toMatch(/^rapport_e2e_\d+_\d{4}-\d{2}-\d{2}\.pdf$/);

            const cheminLocal = await telechargement!.path();
            const contenu = await fs.readFile(cheminLocal);
            expect(contenu.length).toBeGreaterThan(1024);
            expect(contenu.subarray(0, 5).toString('latin1')).toBe('%PDF-');

            await expect(page.getByRole('button', { name: 'Télécharger', exact: true })).toBeEnabled();
        });

        await test.step('Supprimer le rapport de test (nettoyage)', async () => {
            await page.getByRole('button', { name: 'Supprimer', exact: true }).click();
            const modale = page.getByRole('dialog', { name: 'Supprimer ce rapport ?' });
            await expect(modale).toBeVisible();
            await modale.getByRole('button', { name: 'Supprimer', exact: true }).click();

            await expect(page).toHaveURL(new RegExp(`${territoire.urlDiagnostic}/telechargements$`));
            await expect(page.getByRole('button', { name: nomDuRapport })).toHaveCount(0);
        });

        await test.step('Supprimer le compte de test (nettoyage)', async () => {
            await page.goto('/users/unsubscribe/');
            await expect(page).toHaveTitle(/Désinscription/);
            await page.getByRole('button', { name: 'Confirmer' }).click();

            await expect(page).toHaveURL((url) => url.pathname === '/');
            const moi = await page.request.get('/api/me/');
            expect(await moi.json()).toMatchObject({ is_authenticated: false });
        });
    });
});
