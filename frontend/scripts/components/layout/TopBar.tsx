import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import styled from 'styled-components';
import useHtmx from '@hooks/useHtmx';
import { selectIsNavbarOpen, selectIsHeaderVisible } from "@store/navbarSlice";
import ButtonToggleNavbar from "@components/ui/ButtonToggleNavbar";

const activeColor = '#4318FF';

const Container = styled.div<{ $isHeaderVisible: boolean }>`
    position: sticky;
    top: ${({ $isHeaderVisible }) => ($isHeaderVisible ? '80px' : '0')};
    background: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid #EBEBEC;
    z-index: 998;
    padding: 1.5rem 1.5rem;
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: top 0.3s ease;
`;

const LeftSection = styled.div`
    display: flex;
    align-items: center;
`;

const RightSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
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
    const memoizedProjectData = useMemo(() => projectData, [projectData?.id]);
    const htmxRef = useHtmx([memoizedProjectData, projectData?.urls]);
    const isOpen = useSelector(selectIsNavbarOpen);
    const isHeaderVisible = useSelector(selectIsHeaderVisible);

    return (
        <Container ref={htmxRef} $isHeaderVisible={isHeaderVisible}>
            <LeftSection>
                { !isOpen && <ButtonToggleNavbar /> }
                <div>
                    <Title>{ memoizedProjectData?.territory_name }</Title>
                </div>
            </LeftSection>
            <RightSection id="topbar-slot">
                {/* Le contenu sera rendu ici via React Portal */}
            </RightSection>
        </Container>
    );
};

export default memo(TopBar);
