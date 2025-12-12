import styled from "styled-components";

/** Container principal du rapport (mode édition) */
export const ReportContainer = styled.div`
    width: 100%;
    background: white;
    min-height: 100%;
`;

/** Layout pour le mode print/PDF */
export const PrintLayout = styled.div`
    min-height: 100vh;
    background-color: #f6f6f6;
`;

/** Contenu principal en mode print */
export const PrintContent = styled.main`
    margin: 4rem auto;
    background: white;

    @media print {
        border: none !important;
        margin: 0;

        @page {
            size: A4;
            margin: 25mm 20mm;
        }
    }
`;

/** Container pour une page dédiée (CoverPage, AvailableDataPage, etc.) */
export const FullPageContainer = styled.section`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    page-break-after: always;
    height: 100vh;

    @media screen {
        height: 217mm;
        padding: 20mm;
    }
`;

/** Container pour le contenu scrollable (sections standard) */
export const MainContent = styled.div`
    @media screen {
        padding: 20mm;
    }
`;

/** Wrapper pour éviter les coupures de page à l'impression */
export const PrintSafe = styled.div`
    @media print {
        page-break-inside: avoid;
    }
`;
