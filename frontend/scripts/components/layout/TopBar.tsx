import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import styled from 'styled-components';
import { selectIsNavbarOpen } from "@store/navbarSlice";
import ButtonToggleNavbar from "@components/ui/ButtonToggleNavbar";

const activeColor = '#4318FF';

const Container = styled.div`
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid #EBEBEC;
    z-index: 997;
    padding: 1rem 1.5rem;
    min-height: 4.6rem;
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
`;

const LeftSection = styled.div`
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const RightSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-start;
    }
`;

const Title = styled.div`
    color: ${activeColor};
    margin: 0;
    padding: 0;
    font-size: 1.75em;
    line-height: 1.2em;
    font-weight: 600;
`;

const TopBar: React.FC = () => {
    const projectData = useSelector((state: RootState) => state.project.projectData);
    const isOpen = useSelector(selectIsNavbarOpen);

    return (
        <Container>
            <LeftSection>
                { !isOpen && <ButtonToggleNavbar /> }
                <Title>{ projectData?.territory_name }</Title>
            </LeftSection>
            <RightSection id="topbar-slot">
                {/* Le contenu sera rendu ici via React Portal */}
            </RightSection>
        </Container>
    );
};

export default memo(TopBar);
