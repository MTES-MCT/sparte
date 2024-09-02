import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import useHtmx from '@hooks/useHtmx';
import styled, { css } from 'styled-components';

const DownloadList = styled.ul`
    height: 0;
    overflow: hidden;
    transition: height 0.3s ease;
    margin: 0;
    padding: 0;
    list-style-type: none;
`;

const Container = styled.div`
    margin: 1rem;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #4318FF;
    
    &:hover ${DownloadList} {
        height: 192px;
    }
`;

const DownloadTitle = styled.div`
    color: #4318FF;
    font-size: 0.9em;
    display: flex;
    align-items: center;
    gap: 0.2rem;
    flex-direction: column;
    font-weight: 500;

    i {
        font-size: 1.2em;
        background: #4318FF;
        color: #fff;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
`;

const DownloadListItem = styled.li`
    &:first-child {
        margin-top: 1rem;
    }
`;

const DownloadButtonStyle = css`
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 6px;
    color: #96A1C2;
    font-size: 0.8em;
    background-color: #fff;
    transition: color 0.3s ease, background-color 0.3s ease;
    width: 100%;
    background: none;

    &:hover {
        background-color: #4318FF !important;
        color: #FFFFFF !important;
    }
`;

const DownloadLink = styled.a`
    ${DownloadButtonStyle}
`;

const DownloadButton = styled.button`
    ${DownloadButtonStyle}
`;

const DownloadItemIcon = styled.i`
    font-size: 1.4em;
    margin-right: 0.5rem;
`;

const ProjectDownload: React.FC = () => {
    const projectData = useSelector((state: RootState) => state.project.projectData);
    
    const htmxRef = useHtmx([projectData]);

    return (
        <Container ref={htmxRef}>
            <DownloadTitle>
                <i className="bi bi-box-arrow-down"></i>
                Téléchargements
            </DownloadTitle>
            { projectData && (
                <DownloadList role="list">
                    <DownloadListItem role="listitem">
                        <DownloadButton
                            hx-get={`/project/${projectData.id}/tableau-de-bord/telechargement/rapport-conso`}
                            hx-target="#diag_word_form"
                            data-fr-opened="false"
                            aria-controls="fr-modal-download-word"
                        >
                            <DownloadItemIcon aria-hidden="true" className="bi bi-file-earmark-word"></DownloadItemIcon>
                            Analyse de Consommation
                        </DownloadButton>
                    </DownloadListItem>
                    <DownloadListItem role="listitem">
                        <DownloadButton
                            hx-get={`/project/${projectData.id}/tableau-de-bord/telechargement/rapport-complet`}
                            hx-target="#diag_word_form"
                            data-fr-opened="false"
                            aria-controls="fr-modal-download-word"
                        >
                            <DownloadItemIcon aria-hidden="true" className="bi bi-file-earmark-word"></DownloadItemIcon>
                            Analyse complète
                        </DownloadButton>
                    </DownloadListItem>
                    <DownloadListItem role="listitem">
                        <DownloadButton
                            hx-get={`/project/${projectData.id}/tableau-de-bord/telechargement/rapport-local`}
                            hx-target="#diag_word_form"
                            data-fr-opened="false"
                            aria-controls="fr-modal-download-word"
                        >
                            <DownloadItemIcon aria-hidden="true" className="bi bi-file-earmark-word"></DownloadItemIcon>
                            Rapport triennal local
                        </DownloadButton>
                    </DownloadListItem>
                    <DownloadListItem role="listitem">
                        <DownloadLink href={`/project/${projectData.id}/export-excel`}>
                            <DownloadItemIcon aria-hidden="true" className="bi bi-file-earmark-excel"></DownloadItemIcon>
                            Export Excel
                        </DownloadLink>
                    </DownloadListItem>
                </DownloadList>
            )}
        </Container>
    );
};

export default ProjectDownload;