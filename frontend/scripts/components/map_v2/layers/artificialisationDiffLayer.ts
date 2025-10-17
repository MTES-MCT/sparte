import { BaseOcsgeDiffLayer } from "./baseOcsgeDiffLayer";
import { ARTIFICIALISATION_COLOR, DESARTIFICIALISATION_COLOR } from "../constants/config";
import type { StatCategory } from "../types/layer";
import { area } from '@turf/turf';

const ARTIFICIALISATION_FIELD = "new_is_artificial";
const DESARTIFICIALISATION_FIELD = "new_not_artificial";

export class ArtificialisationDiffLayer extends BaseOcsgeDiffLayer {
    constructor(startMillesimeIndex: number, endMillesimeIndex: number, departement: string) {
        super({
            id: "artificialisation-diff-layer",
            type: "fill",
            source: "ocsge-diff-source",
            visible: true,
            opacity: 0.7,
            label: "Différence d'artificialisation",
            description: "Différence d'artificialisation entre deux millésimes consécutifs. Vert = désartificialisation, Rouge = artificialisation.",
        }, startMillesimeIndex, endMillesimeIndex, departement);
    }

    getOptions() {
        return {
            id: this.options.id,
            type: this.options.type,
            source: this.options.source,
            "source-layer": this.getSourceLayerName(),
            filter: [
                "any",
                ["==", ["get", ARTIFICIALISATION_FIELD], true],
                ["==", ["get", DESARTIFICIALISATION_FIELD], true]
            ],
            layout: {
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "fill-color": [
                    "case",
                    ["==", ["get", ARTIFICIALISATION_FIELD], true],
                    ARTIFICIALISATION_COLOR,
                    ["==", ["get", DESARTIFICIALISATION_FIELD], true],
                    DESARTIFICIALISATION_COLOR,
                    "#fff"
                ],
                "fill-opacity": this.options.opacity ?? 0.7,
            },
        };
    }

    extractStats(features: maplibregl.MapGeoJSONFeature[]): StatCategory[] {
        if (features.length === 0) {
            return [];
        }

        // Calculer les surfaces pour chaque catégorie
        let artificialisationSurface = 0;
        let desartificialisationSurface = 0;

        features.forEach(feature => {
            const properties = feature.properties as Record<string, any>;
            const featureArea = area(feature.geometry);

            if (properties[ARTIFICIALISATION_FIELD] === true) {
                artificialisationSurface += featureArea;
            } else if (properties[DESARTIFICIALISATION_FIELD] === true) {
                desartificialisationSurface += featureArea;
            }
        });

        const totalSurface = artificialisationSurface + desartificialisationSurface;

        if (totalSurface === 0) {
            return [];
        }

        // Calculer les pourcentages
        const artificialisationPercent = (artificialisationSurface / totalSurface) * 100;
        const desartificialisationPercent = (desartificialisationSurface / totalSurface) * 100;

        return [
            {
                code: 'artificialisation',
                label: 'Artificialisation',
                color: ARTIFICIALISATION_COLOR,
                value: artificialisationSurface,
                percent: artificialisationPercent
            },
            {
                code: 'desartificialisation',
                label: 'Désartificialisation',
                color: DESARTIFICIALISATION_COLOR,
                value: desartificialisationSurface,
                percent: desartificialisationPercent
            }
        ].filter(cat => cat.percent > 0);
    }
}
