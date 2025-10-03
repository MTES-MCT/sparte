import { BaseLayer, BaseLayerOptions } from "./baseLayer";
import { NomenclatureType, Couverture, Usage } from "../types/ocsge";
import { ControlDefinition, ControlAppliers, LayerState } from "../types";
import { COUVERTURE_COLORS, USAGE_COLORS } from "../constants/ocsge_nomenclatures";

export abstract class BaseOcsgeLayer extends BaseLayer {
    protected millesimeIndex: number;
    protected departement: string;
    protected nomenclature: NomenclatureType;
    protected allowedCodes: { couverture: Couverture[]; usage: Usage[] };

    constructor(options: BaseLayerOptions, millesimeIndex: number, departement: string, nomenclature: NomenclatureType = "couverture") {
        super(options);
        this.millesimeIndex = millesimeIndex;
        this.departement = departement;
        this.nomenclature = nomenclature;

        this.allowedCodes = this.getLayerNomenclature();
    }
    protected abstract getLayerNomenclature(): { couverture: Couverture[]; usage: Usage[] };

    setNomenclature(nomenclature: NomenclatureType) {
        this.nomenclature = nomenclature;
    }

    getDefaultState(): LayerState {
        const allCodesForLayer = this.getLayerNomenclature();
        const defaultCodes = this.nomenclature === "couverture" ? allCodesForLayer.couverture : allCodesForLayer.usage;
        return {
            ...super.getDefaultState(),
            opacity: this.options.opacity ?? 0.7,
            params: {
                nomenclature: this.nomenclature,
                codes: defaultCodes,
            },
        } as LayerState;
    }

    getControlDefinitions(): ControlDefinition[] {
        const standard = super.getControlDefinitions();
        const allCodesForLayer = this.getLayerNomenclature();
        const fullList = this.nomenclature === "couverture" ? allCodesForLayer.couverture : allCodesForLayer.usage;
        return [
            ...standard,
            {
                id: "nomenclature",
                type: "select",
                label: "Nomenclature",
                valuePath: "params.nomenclature",
                options: [
                    { value: "couverture", label: "Couverture" },
                    { value: "usage", label: "Usage" },
                ],
            } as any,
            {
                id: "codes",
                type: "multiselect",
                label: this.nomenclature === "couverture" ? "Codes couverture" : "Codes usage",
                valuePath: "params.codes",
                options: fullList.map(code => ({ value: code, label: code })),
                disabledWhenHidden: true,
            } as any,
        ];
    }

    applyChanges(map: any) {
        if (!map || !map.getLayer(this.options.id)) return;

        const colorExpr = this.getColorExpression();
        map.setPaintProperty(this.options.id, "fill-color", colorExpr);

        const field = this.nomenclature === "couverture" ? "code_cs" : "code_us";
        const allowed = this.nomenclature === "couverture" ? this.allowedCodes.couverture : this.allowedCodes.usage;
        if (allowed.length > 0) {
            const nomenclatureExpr = ["in", ["get", field], ["literal", allowed]];
            const baseFilter = this.getBaseFilter();
            const finalFilter = ["all", baseFilter, nomenclatureExpr];
            map.setFilter(this.options.id, finalFilter);
        }
    }

    getControlAppliers(): ControlAppliers {
        const base = super.getControlAppliers();
        return {
            ...base,
            nomenclature: (state, value) => {
                const v = value as NomenclatureType;
                const all = this.getLayerNomenclature();
                const allowed = v === "couverture" ? all.couverture : all.usage;
                // garder la classe en cohérence pour applyChanges
                this.nomenclature = v;
                this.allowedCodes = {
                    couverture: all.couverture,
                    usage: all.usage,
                };
                const nextState = {
                    ...state,
                    params: { ...state.params, nomenclature: v, codes: allowed },
                };
                return { nextState };
            },
            codes: (state, value) => {
                // mettre à jour allowedCodes selon la nomenclature actuelle
                if (this.nomenclature === "couverture") {
                    this.allowedCodes = { ...this.allowedCodes, couverture: value as Couverture[] };
                } else {
                    this.allowedCodes = { ...this.allowedCodes, usage: value as Usage[] };
                }
                const nextState = { ...state, params: { ...state.params, codes: value } };
                return { nextState };
            },
        };
    }

    protected abstract getBaseFilter(): any[];

    getColorExpression() {
        const field = this.nomenclature === "couverture" ? "code_cs" : "code_us";
        const allowed = this.nomenclature === "couverture" ? this.allowedCodes.couverture : this.allowedCodes.usage;
        const allColors = this.nomenclature === "couverture" ? COUVERTURE_COLORS : USAGE_COLORS;

        const colors = Object.fromEntries(
            Object.entries(allColors).filter(([key]) => (allowed as string[]).includes(key))
        ) as typeof allColors;

        const cases = Object.entries(colors).map(([key]) => [
            "==", ["get", field], key
        ]);
        const colorValues = Object.values(colors).map((color: [number, number, number]) =>
            `rgba(${color.join(", ")}, 0.7)`
        );

        return [
            "case",
            ...cases.flatMap((case_, index) => [case_, colorValues[index]]),
            "rgba(200, 200, 200, 0.7)"
        ];
    }

    protected getSourceLayerName() {
        return `occupation_du_sol_${this.millesimeIndex}_${this.departement}`;
    }

    protected buildFillOptions(filter: any[]) {
        const field = this.nomenclature === "couverture" ? "code_cs" : "code_us";
        const allowed = this.nomenclature === "couverture" ? this.allowedCodes.couverture : this.allowedCodes.usage;
        const nomenclatureExpr = allowed.length > 0
            ? ["in", ["get", field], ["literal", allowed]]
            : null;
        const finalFilter = nomenclatureExpr ? ["all", filter, nomenclatureExpr] : filter;
        return {
            ...this.options,
            "source-layer": this.getSourceLayerName(),
            filter: finalFilter,
            layout: {
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "fill-color": this.getColorExpression(),
                "fill-opacity": this.options.opacity ?? 0.7,
                "fill-outline-color": "rgba(0, 0, 0, 0.3)",
            },
        };
    }

    abstract getOptions(): Record<string, any>;
}


