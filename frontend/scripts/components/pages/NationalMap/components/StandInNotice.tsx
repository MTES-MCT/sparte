import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import type { MapName } from '../domain/mapName';

// Nom de la carte dessinée, détaché de l'explication qui le suit : c'est lui qui contredit le libellé de la ligne
const Drawn = styled.strong`
    display: block;
    margin-bottom: 0.15rem;
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.text};
`;

// Sous une carte du menu dont la vue dessine autre chose que ce que dit son libellé : le nom de
// ce qui est dessiné, puis pourquoi. Rien pour une vue qui dessine la carte elle-même.
const StandInNotice: React.FC<{ name: MapName }> = ({ name: { label, standIn } }) =>
    standIn && (
        <>
            <Drawn>À cette maille, la carte dessine : {label}</Drawn>
            {standIn}.
        </>
    );

export default StandInNotice;
