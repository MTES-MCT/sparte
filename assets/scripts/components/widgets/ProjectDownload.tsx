import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import useHtmx from '@hooks/useHtmx';
import useUrls from '@hooks/useUrls';
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
    background: #cacafb;
    
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
    color: #4318FF;
    font-size: 0.8em;
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
    const urls = useUrls();

    return (
        <Container ref={htmxRef}>
            <DownloadTitle>
                <i className="bi bi-box-arrow-down"></i>
                <div>Téléchargements</div>
            </DownloadTitle>
            { projectData && urls && (
                <DownloadList>
                    <DownloadListItem>
                        <DownloadButton
                            data-hx-get={urls.dowloadConsoReport}
                            data-hx-target="#diag_word_form"
                            data-fr-opened="false"
                            aria-controls="fr-modal-download-word"
                        >
                            <DownloadItemIcon aria-hidden="true" className="bi bi-file-earmark-word"></DownloadItemIcon>
                            Analyse de Consommation
                        </DownloadButton>
                    </DownloadListItem>
                    <DownloadListItem>
                        <DownloadButton
                            data-hx-get={urls.dowloadFullReport}
                            data-hx-target="#diag_word_form"
                            data-fr-opened="false"
                            aria-controls="fr-modal-download-word"
                        >
                            <DownloadItemIcon aria-hidden="true" className="bi bi-file-earmark-word"></DownloadItemIcon>
                            Analyse complète
                        </DownloadButton>
                    </DownloadListItem>
                    <DownloadListItem>
                        <DownloadButton
                            data-hx-get={urls.dowloadLocalReport}
                            data-hx-target="#diag_word_form"
                            data-fr-opened="false"
                            aria-controls="fr-modal-download-word"
                        >
                            <DownloadItemIcon aria-hidden="true" className="bi bi-file-earmark-word"></DownloadItemIcon>
                            Rapport triennal local
                        </DownloadButton>
                    </DownloadListItem>
                    <DownloadListItem>
                        <DownloadLink href={urls.dowloadCsvReport}>
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
