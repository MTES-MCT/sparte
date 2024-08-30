import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: start;
    gap: 1rem;
    font-size: 0.8em;
    color: #A3AED0;
`;

const Footer: React.FC = () => {

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <Container>
                        Mon diagnostic Artificialisation
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default Footer;
