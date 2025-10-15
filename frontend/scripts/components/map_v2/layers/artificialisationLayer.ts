import { NomenclatureType } from "../types/ocsge";
import { BaseOcsgeLayer } from "./baseOcsgeLayer";
import { OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";

export class ArtificialisationLayer extends BaseOcsgeLayer {
	constructor(millesimeIndex: number, departement: string, nomenclature: NomenclatureType = "couverture", millesimes: Array<{ index: number; year?: number }> = []) {
		super({
			id: "artificialisation-layer",
			type: "fill",
			source: "ocsge-source",
			visible: true,
			opacity: 0.7,
			label: "Artificialisation",
			description: "Visualisation des zones artificialisées selon l'occupation du sol (OCS GE). Affiche toutes les surfaces considérées comme artificialisées.",
		}, millesimeIndex, departement, nomenclature, millesimes);
	}

	getLayerNomenclature() {
		return OCSGE_LAYER_NOMENCLATURES.artificialisation;
	}

	getOptions() {
		return this.buildFillOptions(["==", ["get", "is_artificial"], true]);
	}

	protected getBaseFilter() {
		return ["==", ["get", "is_artificial"], true];
	}
}
