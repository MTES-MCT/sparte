import { BaseOcsgeDiffLayer } from "./baseOcsgeDiffLayer";
import { IMPERMEABILISATION_COLOR, DESIMPERMEABILISATION_COLOR } from "../constants/config";
import type { StatCategory } from "../types/layer";
import { area } from '@turf/turf';
import type { LayerSpecification, FilterSpecification } from 'maplibre-gl';

const IMPERMEABILISATION_FIELD = "new_is_impermeable";
const DESIMPERMEABILISATION_FIELD = "new_not_impermeable";

export class ImpermeabilisationDiffLayer extends BaseOcsgeDiffLayer {

    constructor(startMillesimeIndex: number, endMillesimeIndex: number, departement: string) {
        super({
            id: "impermeabilisation-diff-layer",
            type: "fill",
            source: "ocsge-diff-source",
            visible: true,
            opacity: 0.7,
            label: "Différence d'imperméabilisation",
            description: "Différence d'imperméabilisation entre deux millésimes consécutifs. Vert = désimperméabilisation, Rouge = imperméabilisation.",
        }, startMillesimeIndex, endMillesimeIndex, departement);
    }

    getOptions(): LayerSpecification {
        return {
            id: this.options.id,
            type: this.options.type as 'fill',
            source: this.options.source,
            "source-layer": this.getSourceLayerName(),
            filter: [
                "any",
                ["==", ["get", IMPERMEABILISATION_FIELD], true],
                ["==", ["get", DESIMPERMEABILISATION_FIELD], true]
            ] as FilterSpecification,
            layout: {
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "fill-color": [
                    "case",
                    ["==", ["get", IMPERMEABILISATION_FIELD], true],
                    IMPERMEABILISATION_COLOR,
                    ["==", ["get", DESIMPERMEABILISATION_FIELD], true],
                    DESIMPERMEABILISATION_COLOR,
                    "#fff"
                ],
                "fill-opacity": this.options.opacity ?? 0.7,
                "fill-outline-color": "#000",
            },
        } as LayerSpecification;
    }

    extractStats(features: maplibregl.MapGeoJSONFeature[]): StatCategory[] {
        if (features.length === 0) {
            return [];
        }

        // Calculer les surfaces pour chaque catégorie
        let impermeabilisationSurface = 0;
        let desimpermeabilisationSurface = 0;

        features.forEach(feature => {
            const properties = feature.properties;
            const featureArea = area(feature.geometry);

            if (properties && properties[IMPERMEABILISATION_FIELD] === true) {
                impermeabilisationSurface += featureArea;
            } else if (properties && properties[DESIMPERMEABILISATION_FIELD] === true) {
                desimpermeabilisationSurface += featureArea;
            }
        });

        const totalSurface = impermeabilisationSurface + desimpermeabilisationSurface;

        if (totalSurface === 0) {
            return [];
        }

        // Calculer les pourcentages
        const impermeabilisationPercent = (impermeabilisationSurface / totalSurface) * 100;
        const desimpermeabilisationPercent = (desimpermeabilisationSurface / totalSurface) * 100;

        return [
            {
                code: 'impermeabilisation',
                label: 'Imperméabilisation',
                color: IMPERMEABILISATION_COLOR,
                value: impermeabilisationSurface,
                percent: impermeabilisationPercent
            },
            {
                code: 'desimpermeabilisation',
                label: 'Désimperméabilisation',
                color: DESIMPERMEABILISATION_COLOR,
                value: desimpermeabilisationSurface,
                percent: desimpermeabilisationPercent
            }
        ].filter(cat => cat.percent > 0);
    }
}
