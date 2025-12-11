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

/** Container pour une page dédiée (CoverPage, TerritoryInfo, etc.) */
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

/** Container standard pour une section du rapport */
export const SectionContainer = styled.section`
    margin-bottom: 2rem;

    @media print {
        page-break-inside: avoid;
    }
`;

/** Titre principal de section (h2) */
export const SectionTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 700;
    color: #000091;
    margin: 0 0 1.5rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 3px solid #000091;
`;

/** Sous-titre de section (h3) */
export const SubTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: #000091;
    margin: 2rem 0 1rem 0;
`;

/** Sous-sous-titre (h4) */
export const SubSubTitle = styled.h4`
    font-size: 0.95rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem 0;
`;

/** Container pour les graphiques */
export const ChartContainer = styled.div`
    margin: 1.5rem 0;
    background: white;
    padding: 1rem;
    border-radius: 8px;

    @media print {
        background: transparent;
        padding: 0;
        page-break-inside: avoid;
    }
`;

/** Container pour les tableaux de données */
export const DataTableContainer = styled.div`
    margin: 1rem 0;
`;

/** Boîte d'information générale (jaune) */
export const InfoBox = styled.div`
    background: #fff8e6;
    border-left: 4px solid #ffc107;
    padding: 1.25rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 4px;

    h3, h4 {
        margin: 0 0 0.5rem 0;
        font-size: 0.95rem;
        color: #d68000;
    }

    p {
        font-size: 0.8rem !important;
        color: #333 !important;
        line-height: 1.6 !important;
        margin: 0 0 0.75rem 0 !important;
        text-align: left !important;

        &:last-child {
            margin-bottom: 0 !important;
        }
    }

    ul {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
    }

    li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
        font-size: 0.8rem;
    }
`;

/** Boîte mise en avant (bleu gouvernemental) */
export const HighlightBox = styled.div`
    background: #f0f0ff;
    border-left: 4px solid #000091;
    padding: 1.25rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 4px;

    h3, h4 {
        margin: 0 0 0.5rem 0;
        font-size: 0.95rem;
        color: #000091;
    }

    p {
        font-size: 0.8rem !important;
        color: #333 !important;
        line-height: 1.6 !important;
        margin: 0 0 0.5rem 0 !important;
        text-align: left !important;

        &:last-child {
            margin-bottom: 0 !important;
        }
    }

    ul {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
    }

    li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
        font-size: 0.8rem;
    }
`;

/** Boîte de note méthodologique (bleu clair) */
export const NoteBox = styled.div`
    background: #e3f2fd;
    border-left: 4px solid #2196f3;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 4px;

    h4 {
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
        font-weight: 600;
        color: #1565c0;
    }

    p {
        margin: 0 !important;
        font-size: 0.8rem !important;
        color: #333 !important;
        line-height: 1.6 !important;
        text-align: left !important;
    }
`;

/** Boîte de points clés */
export const KeyPointsBox = styled.div`
    background: #f0f8ff;
    border-left: 4px solid #2196f3;
    padding: 1.25rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 4px;

    h4 {
        margin: 0 0 0.75rem 0;
        color: #1565c0;
    }

    ul {
        margin: 0;
        padding-left: 1.5rem;
    }

    li {
        margin-bottom: 0.75rem;
        line-height: 1.6;
        font-size: 0.8rem;

        &:last-child {
            margin-bottom: 0;
        }
    }
`;

/** Boîte d'introduction */
export const IntroBox = styled.div`
    background: #e8f4f8;
    border-left: 4px solid #0078f3;
    padding: 1.25rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 4px;

    p {
        margin: 0 !important;
        font-size: 0.8rem !important;
        color: #333 !important;
        line-height: 1.6 !important;
        text-align: left !important;
    }
`;

/** Boîte de simulation (vert) */
export const SimulationBox = styled.div`
    background: #e8f5e9;
    border-left: 4px solid #4caf50;
    padding: 1.25rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 4px;

    h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.95rem;
        color: #2e7d32;
    }

    p {
        margin: 0 0 0.5rem 0 !important;
        font-size: 0.8rem !important;
        color: #333 !important;
        line-height: 1.6 !important;
        text-align: left !important;

        &:last-child {
            margin-bottom: 0 !important;
        }
    }
`;

/** Boîte de citation */
export const QuoteBox = styled.div`
    background: #f6f6f6;
    border-left: 4px solid #666;
    padding: 1.25rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 4px;
    font-style: italic;

    p {
        margin: 0 0 0.75rem 0 !important;
        font-size: 0.8rem !important;
        color: #333 !important;
        line-height: 1.6 !important;
        text-align: left !important;

        &:last-child {
            margin-bottom: 0 !important;
        }
    }

    ul {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
        list-style: none;
    }

    li {
        margin-bottom: 0.75rem;
        line-height: 1.6;
        position: relative;
        padding-left: 0.5rem;
        font-size: 0.8rem;
    }
`;

/** Référence légale */
export const LegalReference = styled.div`
    background: #f8f8f8;
    border-left: 4px solid #000091;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 0 8px 8px 0;
    font-size: 0.85rem;

    a {
        color: #000091;
    }
`;
