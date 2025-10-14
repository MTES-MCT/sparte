export const layerCategories = ['orthophoto', 'emprise', 'impermeabilisation', 'artificialisation'] as const;
export type LayerCategory = typeof layerCategories[number];

export const layerIds = ['orthophoto-layer', 'emprise-layer', 'impermeabilisation-layer', 'artificialisation-layer'] as const;
export type LayerId = typeof layerIds[number];

export type LayerIdToCategory = {
    'orthophoto-layer': 'orthophoto';
    'emprise-layer': 'emprise';
    'impermeabilisation-layer': 'impermeabilisation';
    'artificialisation-layer': 'artificialisation';
};

export const layerCategoryToFactory = {
    orthophoto: 'orthophoto',
    emprise: 'emprise',
    impermeabilisation: 'impermeabilisation',
} as const;


