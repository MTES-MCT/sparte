import React, { useEffect } from 'react';
import styled from 'styled-components';

const DrawerContainer = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    top: 0;
    right: 0;
    max-width: 620px;
    height: 100%;
    background-color: #fff;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 10px -5px, rgba(0, 0, 0, 0.14) 0px 16px 24px 2px, rgba(0, 0, 0, 0.12) 0px 6px 30px 5px;
    padding: 1rem 2rem;
    overflow-y: auto;
    transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(100%)')};
    transition: transform 0.3s ease-in-out;
    z-index: 1001;
`;

const DrawerTitle = styled.h4`
    margin-top: 1rem;
    font-size: 1em;
    background: #f4f7fe;
    border-radius: 6px;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Icon = styled.i`
    color: #2B3674;
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
    visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
    transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
    z-index: 1000;
`;

interface DrawerProps {
    isOpen: boolean;
    title: string;
    contentHtml: string;
    onClose: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, title, contentHtml, onClose }) => {
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

    return (
        <>
            <Overlay $isOpen={isOpen} onClick={onClose} />
            <DrawerContainer $isOpen={isOpen}>
                <button onClick={onClose} className="fr-btn--close fr-btn" title="Fermer la fenêtre modale" aria-controls="fr-modal-1">Fermer</button>
                <DrawerTitle>{title}<Icon className="bi bi-info-circle" /></DrawerTitle>
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            </DrawerContainer>
        </>
    );
};

export default Drawer;
