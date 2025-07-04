import React from 'react';
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";

const LogementVacantAbstractContainer = styled.div`
    background-color: white;
    padding: 2rem;
    border-radius: 4px;
    margin-top: 2rem;
`;

interface LogementVacantAbstractProps {
    landData: LandDetailResultType;
    children?: React.ReactNode;
}

const LogementVacantAbstract: React.FC<LogementVacantAbstractProps> = ({ landData, children }) => {
    const generateAbstractContent = () => {
        return (
            <div></div>
        );
    };

    return (
        <LogementVacantAbstractContainer>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <h3 className="fr-text--lg fr-mb-2w">
                        <i className="bi bi-lightning-charge text-primary fr-mr-1w" /> 
                        Les logements vacants : un levier actionnable pour la sobriété foncière
                    </h3>
                    {generateAbstractContent() && (
                        <p className="fr-text--sm fr-mb-0">
                            {generateAbstractContent()}
                        </p>
                    )}
                    {children}
                </div>
            </div>
        </LogementVacantAbstractContainer>
    );
};

export default LogementVacantAbstract;
