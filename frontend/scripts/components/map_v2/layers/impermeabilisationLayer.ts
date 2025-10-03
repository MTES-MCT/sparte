import { NomenclatureType } from "../types/ocsge";
import type { LayerState } from "../types";
import { BaseOcsgeLayer } from "./baseOcsgeLayer";
import { OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";

export class ImpermeabilisationLayer extends BaseOcsgeLayer {
	constructor(millesimeIndex: number, departement: string, nomenclature: NomenclatureType = "couverture") {
		super({
			id: "impermeabilisation-layer",
			type: "fill",
			source: "ocsge-source",
			visible: true,
			opacity: 0.7,
			label: "Imperméabilisation",
			description: "Surfaces imperméabilisées basée sur l'occupation du sol (OCS GE). Seules les zones imperméables sont affichées.",
		}, millesimeIndex, departement, nomenclature);
	}

	protected getLayerNomenclature() {
		return OCSGE_LAYER_NOMENCLATURES.impermeabilisation;
	}

	getOptions() {
		return this.buildFillOptions(["==", ["get", "is_impermeable"], true]);
	}

	protected getBaseFilter() {
		return ["==", ["get", "is_impermeable"], true];
	}
}
