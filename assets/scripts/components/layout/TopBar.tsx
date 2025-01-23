import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import { formatDateTime } from '@utils/formatUtils';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import useHtmx from '@hooks/useHtmx';
import useUrls from '@hooks/useUrls';
import Divider from '@components/ui/Divider';

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
    const urls = useUrls();
    const htmxRef = useHtmx([memoizedProjectData, urls]);
    const formattedDate = useMemo(() => formatDateTime(new Date(memoizedProjectData?.created_date)), [memoizedProjectData?.created_date]);
    const location = useLocation();
    const pathsToHidePeriod = ['vacance-des-logements'];
    const shouldDisplayPeriod = !pathsToHidePeriod.some(path => location.pathname.endsWith(path));

    return (
        <Container ref={htmxRef}>
            <div>
                <Title>{ memoizedProjectData?.territory_name }</Title>
                <SubTitle>Diagnostic créé le { formattedDate }</SubTitle>
            </div>
            <ItemContainer>
                { shouldDisplayPeriod && (
                    <>
                        <Item>
                            <ItemTitle><i className="bi bi-calendar4-range"></i> Période d'analyse</ItemTitle>
                            <ItemContent>
                                De { memoizedProjectData?.analyse_start_date } à { memoizedProjectData?.analyse_end_date }
                                {urls &&
                                    <button 
                                        data-fr-opened="false" 
                                        aria-controls="fr-modal-1" 
                                        title="Modifier la période d'analyse du diagnostic" 
                                        data-hx-get={urls.setPeriod} 
                                        data-hx-target="#update_period_form">
                                        <span className="fr-icon-pencil-fill fr-icon--sm" aria-hidden="true"></span>
                                    </button>
                                }
                            </ItemContent>
                        </Item>
                        <Divider color="#e3e4e9" size="30px" />
                    </>
                )}
                <Item>
                    <ItemTitle><i className="bi bi-bullseye"></i> Maille d'analyse</ItemTitle>
                    <ItemContent>{ memoizedProjectData?.level_label }</ItemContent>
                </Item>
            </ItemContainer>
        </Container>
    );
};

export default memo(TopBar);
