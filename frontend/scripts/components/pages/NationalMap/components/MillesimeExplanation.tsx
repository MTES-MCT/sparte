import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { OcsgeDrawerProvider } from '@components/features/ocsge/OcsgeDrawerContext';
import { useGetLandQuery } from '@services/api';
import type { Millesime } from '@services/types/land';
import { millesimeKindOf } from '../artifIndicators';
import { millesimeExplanation, millesimeRows } from '../domain/millesimes';
import type { MapFrame } from '../domain/frame/types';
import { ZONE_HEXAGONE } from '../zones';

const NO_MILLESIMES: Millesime[] = [];

interface MillesimeExplanationProps {
    // Vue affichée : l'explication porte sur ce que l'écran montre, pas sur la vue demandée
    frame: MapFrame | null;
    children: React.ReactNode;
}

// Explication des millésimes de l'OCS GE pour la carte nationale : le tiroir « Comprendre les
// données OCS GE » des diagnostics, ouvert par les renvois de la page (useOcsgeDrawer), avec ce
// que la carte affichée représente et le tableau des années par département de la zone. Les
// millésimes par département se lisent dans la fiche du territoire, comme le font les diagnostics ;
// elle n'est demandée que pour une carte de l'OCS GE.
const MillesimeExplanation: React.FC<MillesimeExplanationProps> = ({ frame, children }) => {
    const ocsge = frame?.data.source === 'artif' ? frame : null;
    const { currentData: land, isError } = useGetLandQuery(ocsge?.chartsLand, { skip: !ocsge });
    const zone = ocsge?.base.zone;
    // L'Hexagone n'a pas de fiche : ses départements sont ceux de la France entière, sans l'outre-mer
    const rows = useMemo(() => millesimeRows(land?.millesimes ?? NO_MILLESIMES, { hexagoneOnly: zone === ZONE_HEXAGONE }), [land, zone]);
    const sections = useMemo(() => {
        if (!ocsge) return [];
        const explained = millesimeExplanation({
            kind: millesimeKindOf(ocsge.indicator),
            reading: ocsge.millesimes,
            zoneName: ocsge.base.title,
            zoneMillesimes: rows,
            image: ocsge.render.renderer === 'grid' && ocsge.render.image !== null,
        });
        if (!isError) return explained;
        return [...explained, { icon: 'bi bi-exclamation-triangle', title: 'Tableau indisponible', paragraphs: ['Les années par département n’ont pas pu être chargées.'] }];
    }, [ocsge, rows, isError]);

    return (
        // Toujours le tableau par index : la carte désigne les millésimes par leur numéro, même pour un
        // seul département. Sans ombre une fois fermé : sur téléphone, elle borderait la carte.
        <OcsgeDrawerProvider millesimes={rows} territoryName={ocsge?.base.title ?? ''} isInterdepartemental extraSections={sections} flushWhenClosed>
            {children}
        </OcsgeDrawerProvider>
    );
};

// La page donne sa vue affichée à l'explication par un hook plutôt qu'en l'enveloppant elle-même :
// le tiroir doit être un ancêtre de tous les renvois (barre de titre, panneau mobile, note de la
// carte), et la vue affichée n'est connue qu'à l'intérieur de la page.
const ExplainedFrameContext = createContext<(frame: MapFrame | null) => void>(() => undefined);

export const MillesimeExplanationHost: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [frame, setFrame] = useState<MapFrame | null>(null);
    return (
        <ExplainedFrameContext.Provider value={setFrame}>
            <MillesimeExplanation frame={frame}>{children}</MillesimeExplanation>
        </ExplainedFrameContext.Provider>
    );
};

// Vue que l'explication décrit : celle que la page affiche
export const useExplainedFrame = (frame: MapFrame | null): void => {
    const setFrame = useContext(ExplainedFrameContext);
    useEffect(() => setFrame(frame), [frame, setFrame]);
};

export default MillesimeExplanation;
