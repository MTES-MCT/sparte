// Valeurs des territoires affichés, sur lesquelles portent les chiffres clés et la note de la carte
import type { NationalMapArtifLand, NationalMapLandIndicators } from '@services/api';
import { millesimeKindOf } from '../../artifIndicators';
import { MillesimeReading, landsMillesimeReading } from '../millesimes';
import type { FrameContext, ShownOcsge } from './types';

// Consommation des territoires affichés
export const consoLandsOf = ({ base, data }: FrameContext): NationalMapLandIndicators[] => {
    if (data.source !== 'conso') return [];
    return base.features.map((feature) => data.response.lands[feature.properties.land_id]).filter((land) => land !== undefined);
};

// Artificialisation des territoires affichés, et noms de ceux que l'OCS GE ne couvre pas complètement
export const artifLandsOf = ({ base, data }: FrameContext): { lands: NationalMapArtifLand[]; missing: string[] } => {
    if (data.source !== 'artif') return { lands: [], missing: [] };
    const { lands } = data.response;
    const shown = base.features.filter((feature) => lands[feature.properties.land_id] !== undefined);
    return {
        lands: shown.map((feature) => lands[feature.properties.land_id]),
        missing: shown
            .filter((feature) => lands[feature.properties.land_id].artif_ha === null)
            .map((feature) => feature.properties.name)
            .sort((a, b) => a.localeCompare(b, 'fr')),
    };
};

// Millésimes des territoires affichés d'une carte de l'OCS GE, pour un stock ou pour un flux selon
// la carte ; null pour une carte de la consommation, ou quand aucun territoire n'en a
export const millesimeReadingOf = (ctx: FrameContext): MillesimeReading | null => {
    if (ctx.data.source !== 'artif') return null;
    return landsMillesimeReading(artifLandsOf(ctx).lands, millesimeKindOf(ctx.indicator));
};

// Étendue des territoires affichés d'une carte de l'OCS GE ; null pour une carte de la consommation
export const shownOcsgeOf = (ctx: FrameContext): ShownOcsge | null => {
    if (ctx.data.source !== 'artif') return null;
    const { lands, missing } = artifLandsOf(ctx);
    return { surfaceHa: lands.reduce((total, land) => total + land.surface_ha, 0), hasMissing: missing.length > 0 };
};
