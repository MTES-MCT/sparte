import { RefObject, useLayoutEffect, useState } from 'react';
import { StageSize, legendOpenByDefault, legendReservation } from '../domain/stage';
import type { LegendModel } from '../domain/frame/types';
import { useStageSize } from './useStageSize';

type StageLayout = {
    stage: StageSize;
    legendOpen: boolean;
    // Choix de l'utilisateur : ouvrir ou replier la légende
    setLegendOpen: (open: boolean) => void;
    // Place prise sur la scène par la légende, en pixels : la carte est dessinée dans le reste
    reserved: { top: number; left: number };
    // La légende a sa place à côté de la carte ; sinon son bouton, ou elle-même, est posé sur la carte
    legendHasItsPlace: boolean;
    // La légende est ouverte par-dessus la carte
    legendCoversMap: boolean;
};

// Mise en page de la scène : sa taille, et la place qu'y prend la légende. `reflow` (d'identité
// stable) recale la carte par territoire dans la place qui lui reste. `legend` : la légende de la
// vue affichée ; `stagedLegend` : celle de la vue qui se prépare.
export const useStageLayout = (stageRef: RefObject<HTMLElement>, reflow: () => void, legend: LegendModel | undefined, stagedLegend: LegendModel | undefined): StageLayout => {
    // La scène change de taille avec la fenêtre et les onglets mobiles : on recale la carte
    const stage = useStageSize(stageRef, reflow);

    // Légende ouverte ou repliée : le choix de l'utilisateur, qui vaut d'une carte à l'autre ;
    // sans choix, elle est repliée sur une scène où elle s'ouvrirait par-dessus la carte
    const [legendChoice, setLegendChoice] = useState<boolean | null>(null);
    const legendOpen = legendChoice ?? legendOpenByDefault(stage);
    // Tant que rien n'est affiché, la place réservée est celle de la légende de la vue qui se
    // prépare : sa carte naît à sa taille définitive, au lieu de se recadrer, et de charger
    // d'autres tuiles, quand sa légende arrive
    const reserved = legendReservation(stage, Boolean(legend ?? stagedLegend) && legendOpen);
    const legendHasItsPlace = reserved.top > 0 || reserved.left > 0;
    const legendCoversMap = Boolean(legend) && legendOpen && stage.legendPlacement === 'over';
    // La place réservée change celle laissée à la carte : celle-ci se recale avant la peinture
    useLayoutEffect(reflow, [reserved.top, reserved.left, reflow]);

    return { stage, legendOpen, setLegendOpen: setLegendChoice, reserved, legendHasItsPlace, legendCoversMap };
};
