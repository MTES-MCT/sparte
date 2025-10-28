import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import { formatDateTime } from '@utils/formatUtils';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import useHtmx from '@hooks/useHtmx';
import useWindowSize from '@hooks/useWindowSize';
import { selectIsNavbarOpen } from "@store/navbarSlice";
import Divider from '@components/ui/Divider';
import ButtonToggleNavbar from "@components/ui/ButtonToggleNavbar";

const primaryColor = '#313178';
const activeColor = '#4318FF';
const secondaryColor = '#a1a1f8';

const Container = styled.div`
    position: sticky;
    top: 80px;
    background: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid #EBEBEC;
    z-index: 998;
    padding: 1rem;
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Title = styled.h1`
    color: ${activeColor};
    margin: 0;
    padding: 0;
    font-size: 2em;
    line-height: 1em;
`;

const SubTitle = styled.div`
    color: ${secondaryColor};
    font-size: 0.8em;
`;

const ItemContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Item = styled.div`
    padding: 0.6rem 0.7rem;
`;

const ItemTitle = styled.div`
    display: flex;
    gap: 0.8rem;
    color: ${primaryColor};
    font-size: 0.85em;
    font-weight: 500;
`;

const ItemContent = styled.div`
    color: ${secondaryColor};
    font-size: 0.85em;
    padding-left: 1.7rem;
    line-height: 0.8rem;

    button {
        background: none !important;
        transition: color .3s ease;

        &:hover {
            color: ${activeColor};
        }
    }
`;

const TopBar: React.FC = () => {
    const projectData = useSelector((state: RootState) => state.project.projectData);
    const memoizedProjectData = useMemo(() => projectData, [projectData?.id]);
    const htmxRef = useHtmx([memoizedProjectData, projectData?.urls]);
    const formattedDate = useMemo(() => formatDateTime(new Date(memoizedProjectData?.created_date)), [memoizedProjectData?.created_date]);
    const isOpen = useSelector(selectIsNavbarOpen);

    return (
        <Container ref={htmxRef}>
            <div className="d-flex align-items-center">
                { !isOpen && <ButtonToggleNavbar /> }
                <div>
                    <Title>{ memoizedProjectData?.territory_name }</Title>
                    <SubTitle>Diagnostic créé le { formattedDate }</SubTitle>
                </div>
            </div>
        </Container>
    );
};

export default memo(TopBar);
