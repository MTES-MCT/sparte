"use client";

import { createConsentManagement } from "@codegouvfr/react-dsfr/consentManagement";

export const { 
    ConsentBannerAndConsentManagement, 
    FooterConsentManagementItem, 
    useConsent
} = createConsentManagement({
    "finalityDescription": {},
    "personalDataPolicyLinkProps": {
        "href": "/confidentialité",
    },
});
