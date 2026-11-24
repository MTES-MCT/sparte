import type { RenderMode } from '../../../indicators';
import type { FrameContext, FrameRender, LegendModel } from '../types';
import { buildBivariate } from './bivariate';
import { buildChoropleth } from './choropleth';
import { buildGrid } from './grid';
import { buildRings } from './rings';
import { buildSymbols } from './symbols';

// Un constructeur par représentation cartographique : ce que le moteur dessine et la légende qui
// l'explique sortent du même calcul, pour ne jamais se contredire
export const RENDER_BUILDERS: Record<RenderMode, (ctx: FrameContext) => { render: FrameRender; legend: LegendModel }> = {
    choropleth: buildChoropleth,
    bivariate: buildBivariate,
    symbols: buildSymbols,
    rings: buildRings,
    grid: buildGrid,
};
