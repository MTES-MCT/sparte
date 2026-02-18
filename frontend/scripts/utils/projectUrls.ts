import type { MenuItem } from '@services/types/project';

const FAQ_URL = "https://faq.mondiagartif.beta.gouv.fr/fr/";

export function buildUrls(landType: string, landSlug: string) {
    const base = `/diagnostic/${landType}/${landSlug}`;
    return {
        synthese: `${base}/`,
        artificialisation: `${base}/artificialisation`,
        impermeabilisation: `${base}/impermeabilisation`,
        rapportLocal: `${base}/rapport-local`,
        trajectoires: `${base}/trajectoires`,
        consommation: `${base}/consommation`,
        logementVacant: `${base}/vacance-des-logements`,
        friches: `${base}/friches`,
        downloads: `${base}/telechargements`,
    };
}

export function buildNavbar(landType: string, landSlug: string) {
    const urls = buildUrls(landType, landSlug);
    const menuItems: MenuItem[] = [
        {
            label: "Synthèse",
            url: urls.synthese,
            icon: "bi bi-grid-1x2",
        },
        {
            label: "Les attendus de la loi C&R",
            icon: "bi bi-check-square",
            subMenu: [
                { label: "Rapport triennal local", url: urls.rapportLocal },
                { label: "Trajectoire de sobriété foncière", url: urls.trajectoires },
            ],
        },
        {
            label: "Pilotage territorial",
            icon: "bi bi-bar-chart",
            subMenu: [
                { label: "Consommation d'espaces NAF", url: urls.consommation },
                { label: "Artificialisation", url: urls.artificialisation },
                { label: "Imperméabilisation", url: urls.impermeabilisation, new: true },
            ],
        },
        {
            label: "Leviers de sobriété foncière",
            icon: "bi bi-bar-chart",
            subMenu: [
                { label: "Vacance des logements", url: urls.logementVacant },
                { label: "Friches", url: urls.friches },
            ],
        },
    ];
    return { menuItems };
}

export function buildFooter() {
    const menuItems: MenuItem[] = [
        { label: "Accessibilité: Non conforme", url: "/accessibilite" },
        { label: "Mentions légales", url: "/mentions-legales" },
        { label: "Données personnelles", url: "/confidentialit%C3%A9" },
        { label: "Centre d'aide", url: FAQ_URL, target: "_blank" },
        { label: "Contactez-nous", url: "/contact" },
    ];
    return { menuItems };
}

export function buildHeader(isAuthenticated: boolean) {
    const menuItems: MenuItem[] = [
        { label: "Centre d'aide", url: FAQ_URL, target: "_blank", shouldDisplay: true },
        { label: "Mes diagnostics", url: "/diagnostic/mes-diagnostics", shouldDisplay: isAuthenticated },
        { label: "Mon compte", url: "/users/profile/", shouldDisplay: isAuthenticated },
        { label: "Se déconnecter", url: "/users/signout/", shouldDisplay: isAuthenticated },
        { label: "Se connecter", url: "/users/signin/", shouldDisplay: !isAuthenticated },
        { label: "S'inscrire", url: "/users/signup/", shouldDisplay: !isAuthenticated },
    ];
    return {
        logos: [
            {
                src: "/static/img/republique-francaise-logo.svg",
                alt: "Logo République Française",
                height: "70px",
            },
            {
                src: "/static/img/logo-mon-diagnostic-artificialisation.svg",
                alt: "Logo Mon Diagnostic Artificialisation",
                url: "/",
                height: "50px",
            },
        ],
        search: {
            createUrl: "/diagnostic/nouveau",
        },
        menuItems,
    };
}
