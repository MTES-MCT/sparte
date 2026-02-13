import React, { useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts';
import ChartDataSource from './ChartDataSource';
import ChartDataTable from './ChartDataTable';

/* ── Layout ──────────────────────────────────────── */

const Overlay = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
    visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
    transition: opacity 0.25s ease, visibility 0.25s ease;
    z-index: 1000;
`;

const Panel = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 1200px;
    max-height: 90vh;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    z-index: 1001;
    opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
    visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
    transition: opacity 0.25s ease, visibility 0.25s ease;
`;

/* ── Header ──────────────────────────────────────── */

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 2rem;
    border-bottom: 1px solid #e5e5e5;
    flex-shrink: 0;
`;

const Title = styled.h2`
    font-size: 1.125rem;
    margin: 0;
`;

/* ── Body ────────────────────────────────────────── */

const Body = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem 2rem 2rem;
`;

/* ── Toolbar ─────────────────────────────────────── */

const Toolbar = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 1.25rem;
`;

/* ── Sections ────────────────────────────────────── */

const ChartContainer = styled.div`
    width: 100%;
    min-height: 450px;
`;

const TableSection = styled.div`
    margin-top: 1.5rem;
`;

const Separator = styled.div`
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid #e5e5e5;
`;

/* ── Types ────────────────────────────────────────── */

interface ChartExplorerProps {
    isOpen: boolean;
    onClose: () => void;
    chartTitle?: string;
    chartOptions: Highcharts.Options;
    sources: string[];
    dataTable?: {
        headers: string[];
        rows: any[];
        boldFirstColumn?: boolean;
        boldLastColumn?: boolean;
        boldLastRow?: boolean;
    };
    children?: React.ReactNode;
    isMap?: boolean;
}

/* ── Component ───────────────────────────────────── */

const ChartExplorer: React.FC<ChartExplorerProps> = ({
    isOpen,
    onClose,
    chartTitle,
    chartOptions,
    sources,
    dataTable,
    children,
    isMap = false,
}) => {
    const modalChartRef = useRef<any>(null);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Clone chart options for the modal (Highcharts mutates them)
    const modalChartOptions = useMemo(() => {
        if (!chartOptions) return {};
        const cloned = JSON.parse(JSON.stringify(chartOptions));
        if (cloned.chart) {
            cloned.chart.height = 500;
        }
        return cloned;
    }, [chartOptions]);

    const handleDownloadPNG = () => {
        if (modalChartRef.current?.chart) {
            modalChartRef.current.chart.exportChart({ type: 'image/png' });
        }
    };

    const hasTable = !!dataTable?.headers?.length;

    return (
        <>
            <Overlay $isOpen={isOpen} onClick={onClose} />
            <Panel
                $isOpen={isOpen}
                role="dialog"
                aria-modal="true"
                aria-label={chartTitle || 'Explorer les données'}
            >
                <Header>
                    <Title>{chartTitle || 'Explorer les données'}</Title>
                    <button
                        onClick={onClose}
                        className="fr-btn--close fr-btn"
                        title="Fermer"
                    >
                        Fermer
                    </button>
                </Header>

                <Body>
                    <Toolbar>
                        <button
                            className="fr-btn fr-icon-download-line fr-btn--tertiary fr-btn--sm fr-btn--icon-left"
                            onClick={handleDownloadPNG}
                        >
                            Télécharger
                        </button>
                    </Toolbar>

                    <ChartContainer>
                        <HighchartsReact
                            ref={modalChartRef}
                            highcharts={Highcharts}
                            options={modalChartOptions}
                            constructorType={isMap ? 'mapChart' : 'chart'}
                        />
                    </ChartContainer>

                    {hasTable && (
                        <TableSection>
                            <h6 className="fr-mb-1w">Données du graphique</h6>
                            <ChartDataTable
                                data={dataTable}
                                title={chartTitle || ''}
                            />
                        </TableSection>
                    )}

                    {sources.length > 0 && (
                        <Separator>
                            <ChartDataSource sources={sources} displayMode="text" />
                        </Separator>
                    )}

                    {children && (
                        <Separator>
                            <h6 className="fr-mb-1w">Détails du calcul</h6>
                            {children}
                        </Separator>
                    )}
                </Body>
            </Panel>
        </>
    );
};

export default ChartExplorer;
