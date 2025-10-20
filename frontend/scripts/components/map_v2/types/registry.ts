export const layerCategories = ['orthophoto', 'emprise', 'impermeabilisation', 'artificialisation', 'impermeabilisation-diff', 'ocsge-diff-centroid-cluster', 'ocsge-diff-centroid-cluster-count'] as const;
export type LayerCategory = typeof layerCategories[number];

export const layerIds = ['orthophoto-layer', 'emprise-layer', 'impermeabilisation-layer', 'artificialisation-layer', 'impermeabilisation-diff-layer', 'ocsge-diff-centroid-cluster', 'ocsge-diff-centroid-cluster-count'] as const;
export type LayerId = typeof layerIds[number];

export type LayerIdToCategory = {
    'orthophoto-layer': 'orthophoto';
    'emprise-layer': 'emprise';
    'impermeabilisation-layer': 'impermeabilisation';
    'artificialisation-layer': 'artificialisation';
    'impermeabilisation-diff-layer': 'impermeabilisation-diff';
    'ocsge-diff-centroid-cluster': 'ocsge-diff-centroid-cluster';
    'ocsge-diff-centroid-cluster-count': 'ocsge-diff-centroid-cluster-count';
};

export const layerCategoryToFactory = {
    orthophoto: 'orthophoto',
    emprise: 'emprise',
    impermeabilisation: 'impermeabilisation',
    'impermeabilisation-diff': 'impermeabilisation-diff',
    'ocsge-diff-centroid-cluster': 'ocsge-diff-centroid-cluster',
    'ocsge-diff-centroid-cluster-count': 'ocsge-diff-centroid-cluster-count',
} as const;


