import { BaseOcsgeDiffLayer } from "./baseOcsgeDiffLayer";
import {
    ARTIFICIALISATION_COLOR,
    DESARTIFICIALISATION_COLOR,
    ARTIFICIALISATION_FIELD,
    DESARTIFICIALISATION_FIELD,
    DIFF_FIELDS,
    OCSGE_DIFF_OBJECTS_MIN_ZOOM,
    OCSGE_DIFF_DONUTS_FADE_OUT_ZOOM,
    OCSGE_DIFF_OUTLINE_COLOR,
    OCSGE_DIFF_OUTLINE_PULSE_PERIOD_MS,
    OCSGE_DIFF_OUTLINE_MIN_WIDTH,
    OCSGE_DIFF_OUTLINE_MAX_WIDTH,
    OCSGE_DIFF_TILES_MIN_ZOOM
} from "../constants/config";
import type { LayerSpecification, FilterSpecification, ExpressionSpecification, Map as MaplibreMap } from 'maplibre-gl';
import type { LandDetailResultType } from "@services/types/land";

export class ArtificialisationDiffLayer extends BaseOcsgeDiffLayer {
    constructor(startMillesimeIndex: number, endMillesimeIndex: number, departement: string, landData?: LandDetailResultType) {
        super({
            id: "artificialisation-diff-layer",
            type: "fill",
            source: "ocsge-artif-diff-source",
            visible: true,
            opacity: 0.7,
        }, startMillesimeIndex, endMillesimeIndex, departement, landData);
    }

    protected getSourceLayerName(): string {
        return `artif_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}`;
    }

    /** Opacité nulle sous le seuil, pleine à partir du seuil, fondu linéaire entre les deux. */
    private fadeInOpacity(opacity: number): ExpressionSpecification {
        return [
            "interpolate", ["linear"], ["zoom"],
            OCSGE_DIFF_OBJECTS_MIN_ZOOM - 1, 0,
            OCSGE_DIFF_OBJECTS_MIN_ZOOM, opacity
        ];
    }

    setOpacity(opacity: number): void {
        if (!this.map?.getLayer(this.getId())) return;
        this.map.setPaintProperty(this.getId(), "fill-opacity", this.fadeInOpacity(opacity));
        this.options.opacity = opacity;
    }

    private get outlineId(): string {
        return `${this.getId()}-outline`;
    }

    setVisibility(visible: boolean): void {
        super.setVisibility(visible);
        if (this.map?.getLayer(this.outlineId)) {
            this.map.setLayoutProperty(this.outlineId, "visibility", visible ? "visible" : "none");
        }
    }

    attach(map: MaplibreMap): void {
        super.attach(map);
        this.startOutlinePulse(map);
    }

    /**
     * Fait pulser la largeur du contour dès qu'il devient visible, c'est-à-dire
     * quand les donuts commencent à s'estomper, et sans limite de zoom ensuite.
     * La boucle s'arrête avec la carte.
     */
    private startOutlinePulse(map: MaplibreMap): void {
        let frame = 0;
        let wasPulsing = false;
        // Contour principal + clones par département ; rafraîchi quand le style change.
        let outlineIds: string[] = [];
        const refreshOutlineIds = () => {
            outlineIds = (map.getStyle()?.layers ?? [])
                .map((l) => l.id)
                .filter((id) => id.startsWith(this.outlineId));
        };
        map.on("styledata", refreshOutlineIds);

        const setWidth = (width: number) => {
            for (const id of outlineIds) {
                if (map.getLayer(id)) map.setPaintProperty(id, "line-width", width);
            }
        };

        const tick = (now: number) => {
            const zoom = map.getZoom();
            const inRange = zoom >= OCSGE_DIFF_DONUTS_FADE_OUT_ZOOM - 1;

            if (inRange && outlineIds.length > 0 && this.options.visible) {
                const phase = (1 + Math.sin((2 * Math.PI * now) / OCSGE_DIFF_OUTLINE_PULSE_PERIOD_MS)) / 2;
                setWidth(OCSGE_DIFF_OUTLINE_MIN_WIDTH + (OCSGE_DIFF_OUTLINE_MAX_WIDTH - OCSGE_DIFF_OUTLINE_MIN_WIDTH) * phase);
                wasPulsing = true;
            } else if (wasPulsing) {
                setWidth(OCSGE_DIFF_OUTLINE_MIN_WIDTH);
                wasPulsing = false;
            }
            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        map.once("remove", () => {
            cancelAnimationFrame(frame);
            map.off("styledata", refreshOutlineIds);
        });
    }

    protected getPositiveField(): string {
        return DIFF_FIELDS.artificialisation.positive;
    }

    protected getNegativeField(): string {
        return DIFF_FIELDS.artificialisation.negative;
    }

    protected getPositiveColor(): string {
        return DIFF_FIELDS.artificialisation.positiveColor;
    }

    protected getNegativeColor(): string {
        return DIFF_FIELDS.artificialisation.negativeColor;
    }

    protected getPositiveLabel(): string {
        return DIFF_FIELDS.artificialisation.positiveLabel;
    }

    protected getNegativeLabel(): string {
        return DIFF_FIELDS.artificialisation.negativeLabel;
    }

    protected getPositiveCode(): string {
        return DIFF_FIELDS.artificialisation.positiveCode;
    }

    protected getNegativeCode(): string {
        return DIFF_FIELDS.artificialisation.negativeCode;
    }

    getOptions(): LayerSpecification[] {
        const territoryFilter = this.getTerritoryFilter();

        const dataFilter = [
            "any",
            ["==", ["get", ARTIFICIALISATION_FIELD], true],
            ["==", ["get", DESARTIFICIALISATION_FIELD], true]
        ] as FilterSpecification;

        const finalFilter = territoryFilter
            ? ["all", territoryFilter, dataFilter] as FilterSpecification
            : dataFilter;

        const fillLayer = {
            id: this.options.id,
            type: this.options.type as 'fill',
            source: this.options.source,
            "source-layer": this.getSourceLayerName(),
            minzoom: OCSGE_DIFF_OBJECTS_MIN_ZOOM - 1,
            filter: finalFilter,
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
                "fill-opacity": this.fadeInOpacity(this.options.opacity ?? 0.7),
            },
        } as LayerSpecification;

        // Contour pulsant permanent : apparaît en fondu pendant que les donuts
        // s'estompent, puis reste visible à tous les zooms. Son minzoom bas force
        // le chargement des tuiles (contour invisible avant) pour que le survol
        // d'un donut retrouve ses polygones.
        const outlineLayer = {
            id: this.outlineId,
            type: "line",
            source: this.options.source,
            "source-layer": this.getSourceLayerName(),
            minzoom: OCSGE_DIFF_TILES_MIN_ZOOM,
            filter: finalFilter,
            layout: {
                visibility: this.options.visible ? "visible" : "none",
                "line-join": "round",
            },
            paint: {
                "line-color": OCSGE_DIFF_OUTLINE_COLOR,
                "line-width": OCSGE_DIFF_OUTLINE_MIN_WIDTH,
                "line-opacity": [
                    "interpolate", ["linear"], ["zoom"],
                    OCSGE_DIFF_DONUTS_FADE_OUT_ZOOM - 1, 0,
                    OCSGE_DIFF_DONUTS_FADE_OUT_ZOOM, 1
                ],
            },
        } as LayerSpecification;

        return [fillLayer, outlineLayer];
    }
}
