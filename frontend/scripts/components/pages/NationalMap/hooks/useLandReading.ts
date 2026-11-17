import { MutableRefObject, useCallback, useEffect, useMemo, useState } from 'react';
import type { MapFrame } from '../domain/frame/types';
import { LandReading, landReadingOf } from '../domain/landReading';

type Opening = {
    // La vue demandée charge : la carte montre encore la précédente
    pending: boolean;
    onZoneChange?: (zone: string, name?: string) => void;
};

type LandTouchReading = {
    // Lecture du territoire touché ; null : aucun territoire de la carte affichée n'est lu
    reading: LandReading | null;
    landId: string | null;
    // Appui du doigt : l'identifiant du territoire à lire, null pour un appui hors des territoires
    read: (landId: string | null) => void;
    close: () => void;
    // Ouvre le territoire lu, s'il s'ouvre
    open: () => void;
};

// Territoire lu au doigt sur la carte par territoire : sur un écran tactile, l'appui lit, et la
// fiche de lecture ouvre (voir pressOutcome). `live` : ce qui se lit au moment d'ouvrir.
export const useLandReading = (frame: MapFrame | null, live: MutableRefObject<Opening>): LandTouchReading => {
    const [readLandId, setReadLandId] = useState<string | null>(null);
    // Lecture du territoire touché : elle suit la carte affichée, et disparaît avec le territoire
    const reading = useMemo(() => landReadingOf(frame, readLandId), [frame, readLandId]);
    const close = useCallback(() => setReadLandId(null), []);
    const open = useCallback(() => {
        const opens = reading?.opens;
        // Pendant un chargement, la carte montre encore la vue précédente : rien ne s'ouvre
        if (opens && !live.current.pending) live.current.onZoneChange?.(opens.zone, opens.name);
    }, [reading, live]);
    // Le territoire lu désigne un territoire du fond quitté
    const baseKey = frame?.base.key ?? null;
    useEffect(() => setReadLandId(null), [baseKey]);

    return { reading, landId: reading?.landId ?? null, read: setReadLandId, close, open };
};
