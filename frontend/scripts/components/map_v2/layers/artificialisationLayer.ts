import { NomenclatureType } from "../types/ocsge";
import { BaseOcsgeLayer } from "./baseOcsgeLayer";
import { OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";

export class ArtificialisationLayer extends BaseOcsgeLayer {
	constructor(millesimeIndex: number, departement: string, nomenclature: NomenclatureType = "couverture") {
		super({
			id: "artificialisation-layer",
			type: "fill",
			source: "ocsge-source",
			visible: true,
			opacity: 0.7,
		}, millesimeIndex, departement, nomenclature);
	}

	protected getLayerNomenclature() {
		return OCSGE_LAYER_NOMENCLATURES.artificialisation;
	}

	getOptions() {
		return this.buildFillOptions(["==", ["get", "is_artificial"], true]);
	}

	protected getBaseFilter() {
		return ["==", ["get", "is_artificial"], true];
	}
}
