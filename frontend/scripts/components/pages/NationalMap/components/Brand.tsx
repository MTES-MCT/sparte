import React from 'react';
import styled from 'styled-components';
import { buildHeader } from '@utils/projectUrls';

// Marque du site : bloc République Française et logo du site, celui-ci en lien vers l'accueil.
// La page de la carte n'a pas l'en-tête des autres pages, pour laisser toute la hauteur de la
// fenêtre à la carte : la marque se loge en haut du menu, ou dans la barre d'onglets sur mobile.

// Mêmes logos que l'en-tête des autres pages ; l'état de connexion n'y change rien
const LOGOS = buildHeader(false).logos;
// Réduction par rapport à l'en-tête, pour tenir dans la hauteur de la barre de titre ou des onglets
const SCALE = { full: 0.75, compact: 0.5 };

const Wrapper = styled.div<{ $compact: boolean }>`
    display: flex;
    align-items: center;
    gap: ${({ $compact }) => ($compact ? '0.5rem' : '1.25rem')};
    min-width: 0;
`;

const Logo = styled.img`
    display: block;
    width: auto;
`;

// Le souligné des liens du système de design n'a pas lieu d'être sous une image
const HomeLink = styled.a`
    display: block;
    background-image: none;
`;

interface BrandProps {
    // Barre d'onglets mobile : logo du site seul, plus petit
    compact?: boolean;
}

const Brand: React.FC<BrandProps> = ({ compact = false }) => (
    <Wrapper $compact={compact}>
        {LOGOS.filter((logo) => !compact || logo.url).map((logo) => {
            const image = <Logo src={logo.src} alt={logo.alt} style={{ height: `calc(${logo.height} * ${compact ? SCALE.compact : SCALE.full})` }} />;
            return logo.url ? (
                <HomeLink key={logo.src} href={logo.url}>
                    {image}
                </HomeLink>
            ) : (
                <React.Fragment key={logo.src}>{image}</React.Fragment>
            );
        })}
    </Wrapper>
);

export default Brand;
