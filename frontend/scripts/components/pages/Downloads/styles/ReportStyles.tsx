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
            margin: 25mm 18mm;
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

export const MainContent = styled.div`
    @media screen {
        padding: 15mm 20mm;
    }
`;

/** Wrapper pour éviter les coupures de page à l'impression */
export const PrintSafe = styled.div`
    @media print {
        page-break-inside: avoid;
    }
`;

export const ReportTypography = styled.div`
    font-family: 'Marianne', system-ui, sans-serif;
    font-size: 10pt;
    line-height: 1.5;
    color: #1e1e1e;

    @media print {
        font-size: 9pt;
    }

    .fr-text--muted {
        color: #6c757d;
    }

    section {
        margin-bottom: 4rem;

        p {
            font-size: 9pt !important;
            line-height: 1.5 !important;
            margin-bottom: 0.5rem !important;
            text-align: justify;

            @media print {
                font-size: 9pt !important;
            }
        }
        
        @media print {
            page-break-inside: avoid;
        }
    }

    h2 {
        font-size: 15pt !important;
        font-weight: 700;
        color: #000091;
        margin: 0 0 2rem 0;
        padding-bottom: 0.6rem;
        border-bottom: 2px solid #EBEBEC;
        line-height: 1.3;
    }

    h3 {
        font-size: 13pt !important;
        font-weight: 600;
        color: #000091;
        margin: 3rem 0 2rem 0;
        line-height: 1.3;
    }

    h4 {
        font-size: 12pt !important;
        font-weight: 600;
        color: #000091;
        margin: 3rem 0 2rem 0;
        line-height: 1.3;
    }

    ul, ol, .fr-list {
        margin: 0.5rem 0 0.75rem 0;
        padding-left: 1.25rem;
    }

    li {
        font-size: 10pt !important;
        line-height: 1.5;
        margin-bottom: 0.3rem;

        @media print {
            font-size: 9pt !important;
        }
    }

    .fr-callout {
        padding: 0.75rem 1rem;
        margin: 0.75rem 0 2rem 0;

        @media print {
            page-break-inside: avoid;
        }
    }

    .fr-callout__title {
        font-weight: 600;
        color: #000091;
        margin: 0 0 0.4rem 0;
    }

    .fr-callout__text {
        font-size: 9.5pt !important;
        line-height: 1.5;
        margin: 0 0 0.4rem 0;
        text-align: left;

        @media print {
            font-size: 8.5pt !important;
        }

        &:last-child {
            margin-bottom: 0;
        }
    }

    .fr-callout ul, .fr-callout ol {
        margin: 0.3rem 0;
        padding-left: 1.1rem;
    }

    .fr-callout li {
        margin-bottom: 0.2rem;
    }

    a {
        color: #000091;
    }

    .highcharts-title {
        font-size: 11pt !important;
        font-weight: 600 !important;

        @media print {
            font-size: 10pt !important;
        }
    }

    .highcharts-subtitle {
        font-size: 9pt !important;

        @media print {
            font-size: 8pt !important;
        }
    }

    .highcharts-axis-title,
    .highcharts-legend-item text {
        font-size: 8pt !important;
    }

    .highcharts-data-label text {
        font-size: 8pt !important;
    }
`;

/** Info d'édition dans les callouts (visible uniquement en mode édition) */
export const CalloutEditInfo = styled.div`
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    
    @media print {
        display: none !important;
    }
`;

export const TwoColumnLayout = styled.div<{ $columns?: number }>`
    column-count: ${props => props.$columns || 2};
    -webkit-column-count: ${props => props.$columns || 2};
    -moz-column-count: ${props => props.$columns || 2};
    column-gap: 1.5rem;
    -webkit-column-gap: 1.5rem;
    -moz-column-gap: 1.5rem;
    margin: 1rem 0;

    @media print {
        column-count: ${props => props.$columns || 2} !important;
        -webkit-column-count: ${props => props.$columns || 2} !important;
        -moz-column-count: ${props => props.$columns || 2} !important;
        column-gap: 1rem;
        -webkit-column-gap: 1rem;
        -moz-column-gap: 1rem;
    }

    @media (max-width: 1280px) {
        column-count: 1;
        -webkit-column-count: 1;
        -moz-column-count: 1;
    }

    p, ul, ol, li {
        break-inside: avoid;
        -webkit-column-break-inside: avoid;
        page-break-inside: avoid;
    }
`;
