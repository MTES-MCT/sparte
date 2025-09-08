"use client";

import { createConsentManagement } from "@codegouvfr/react-dsfr/consentManagement";

// Vérifier si Google Ads est activé (.env)
const isGoogleAdsEnabled = (() => {
    if (typeof window === 'undefined') return false;
    
    const metaTag = document.querySelector('meta[name="google-ads-enabled"]');
    return metaTag?.getAttribute('content') === 'true';
})();

const loadGoogleAds = () => {
    if (!isGoogleAdsEnabled) return;
    
    if (document.getElementById('google-ads-script')) return;
    
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-11157347812';
    script.async = true;
    script.id = 'google-ads-script';
    
    script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) { window.dataLayer!.push(args); }
        gtag('js', new Date());
        gtag('config', 'AW-11157347812');
    };
    
    document.head.appendChild(script);
};

const removeGoogleAds = () => {    
    const script = document.getElementById('google-ads-script');
    if (script) {
        script.remove();
    }
    
    if (window.dataLayer) {
        window.dataLayer = [];
    }
    
    const cookiesToRemove = ['_ga', '_gid', '_gat', '_gcl_au'];
    cookiesToRemove.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
    });
};

type FinalityDescription = {
    advertising?: {
        title: string;
        description: string;
    };
};

const getFinalityDescription = (): FinalityDescription => {
    const finalites: FinalityDescription = {};
    
    if (isGoogleAdsEnabled) {
        return {
            ...finalites,
            "advertising": {
                "title": "Google Ads",
                "description": "Nous utilisons Google Ads pour mesurer l'efficacité de nos campagnes d'information. Aucune donnée personnelle identifiable n'est conservée."
            }
        };
    }
    
    return finalites;
};

export const { 
    ConsentBannerAndConsentManagement, 
    FooterConsentManagementItem, 
    useConsent
} = createConsentManagement<FinalityDescription>({
    "finalityDescription": getFinalityDescription,
    "personalDataPolicyLinkProps": {
        "href": "/confidentialité",
    },
    "consentCallback": async ({ finalityConsent, finalityConsent_prev }) => {
        if (isGoogleAdsEnabled) {
            if (finalityConsent.advertising) {
                loadGoogleAds();
            } else {
                removeGoogleAds();
            }
        }


    }
});
