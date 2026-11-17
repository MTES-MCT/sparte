// Lecture d'un territoire de la carte par territoire : ce que son infobulle en dit au survol, et
// ce que sa fiche en dit sur un écran tactile, avec la zone que la fiche propose d'ouvrir.
import { classIndexOf } from './frame/render/choropleth';
import type { FrameRender, LandPoint, MapFrame } from './frame/types';
import { MapTip, tipOf } from './tip';

type TerritoryRender = Extract<FrameRender, { renderer: 'territory' }>;

// Couleur de la classe d'un territoire, pour la pastille de sa lecture : celle dont il est peint.
// Un territoire dont la valeur est une borne de classe est peint de la classe supérieure (règle de
// Highcharts). Rien sur une carte en cercles ou en anneaux, où le fond des territoires est neutre,
// ni pour un territoire sans donnée, dont le gris n'est pas une classe.
export const landSwatch = (render: TerritoryRender, { value, color, legendKey }: Pick<LandPoint, 'value' | 'color' | 'legendKey'>): string | null => {
    if (legendKey === null || value === null || value === undefined) return null;
    if (render.mode === 'bivariate') return color ?? null;
    if (render.mode !== 'choropleth') return null;
    const index = classIndexOf(value, render.classes, 'upper');
    return index === null ? null : render.classes[index].color;
};

export type LandReading = {
    landId: string;
    tip: MapTip;
    // Zone que la fiche propose d'ouvrir ; null quand le territoire ne s'ouvre pas (communes)
    opens: { zone: string; name: string } | null;
};

// null : la carte affichée n'est pas une carte par territoire, ou ne montre pas ce territoire.
// La lecture suit la carte : changer d'indicateur ou de période sous une fiche ouverte la met à jour.
export const landReadingOf = (frame: Pick<MapFrame, 'base' | 'render'> | null, landId: string | null): LandReading | null => {
    if (!frame || landId === null || frame.render.renderer !== 'territory') return null;
    const { render, base } = frame;
    const point = render.points.find((candidate) => candidate.land_id === landId);
    if (!point) return null;
    return {
        landId,
        tip: tipOf({ name: point.name, valueText: point.valueText, swatch: landSwatch(render, point) }),
        opens: base.clickable && point.zone ? { zone: point.zone, name: point.name } : null,
    };
};
