import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';

const Container = styled.div`
    background: white;
    border-radius: 4px;
    display: flex;
    height: 180px;
    overflow: hidden;
    border: 1px solid #EBEBEC;
`;

const TabsList = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 180px;
`;

const Tab = styled.button`
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1rem;
    font-size: 0.8rem;
    flex: 1;
    width: 100%;
    background-color: #F5F5FE;
    border-left: 3px solid transparent;
    font-weight: 700;
    transition: all 0.3s ease;

    &:hover, &[aria-selected="true"] {
        color: var(--text-action-high-blue-france);
        background: #fff !important;
        border-left-color: var(--border-action-high-blue-france);
    }

    i {
        font-size: 0.85rem;
    }
`;

const TabContent = styled.div`
    flex: 1;
    padding: 1rem 1.25rem;
    overflow-y: auto;
    border-left: 1px solid var(--border-default-grey);
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--text-default-grey);

    p, ul, li {
        font-size: 0.85rem;
        line-height: 1.5;
        margin-bottom: 0.35rem;

        &:last-child {
            margin-bottom: 0;
        }
    }

    ul {
        padding-left: 1.25rem;
    }

    a {
        color: var(--text-action-high-blue-france);
    }
`;

export interface TriptychSection {
    content: ReactNode;
    summary: string;
}

interface TriptychProps {
    definition: TriptychSection;
    donnees: TriptychSection;
    cadreReglementaire?: TriptychSection;
    className?: string;
}

interface TabConfig {
    key: 'definition' | 'donnees' | 'reglementation';
    title: string;
    icon: string;
    section: TriptychSection;
}

const Triptych: React.FC<TriptychProps> = ({ definition, donnees, cadreReglementaire, className }) => {
    const [activeTab, setActiveTab] = useState<'definition' | 'donnees' | 'reglementation'>('definition');

    const tabs: TabConfig[] = [
        {
            key: 'definition',
            title: 'Définition',
            icon: 'bi bi-book',
            section: definition,
        },
        {
            key: 'donnees',
            title: 'Données',
            icon: 'bi bi-database',
            section: donnees,
        },
        ...(cadreReglementaire
            ? [
                {
                    key: 'reglementation' as const,
                    title: 'Réglementation',
                    icon: 'bi bi-shield-check',
                    section: cadreReglementaire,
                },
              ]
            : []),
    ];

    const activeSection = tabs.find(t => t.key === activeTab)?.section;

    return (
        <Container className={className}>
            <TabsList role="tablist" aria-orientation="vertical">
                {tabs.map((tab) => (
                    <Tab
                        key={tab.key}
                        role="tab"
                        aria-selected={activeTab === tab.key}
                        aria-controls={`tabpanel-${tab.key}`}
                        onClick={() => setActiveTab(tab.key)}
                        type="button"
                    >
                        <i className={tab.icon} aria-hidden="true" />
                        <span>{tab.title}</span>
                    </Tab>
                ))}
            </TabsList>
            <TabContent
                role="tabpanel"
                id={`tabpanel-${activeTab}`}
                aria-labelledby={activeTab}
            >
                {activeSection?.content}
            </TabContent>
        </Container>
    );
};

export default Triptych;
