import { NomenclatureType } from "../types/ocsge";
import { BaseOcsgeLayer } from "./baseOcsgeLayer";
import { OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";
import type { StatCategory } from "../types/layer";
import type { FilterSpecification } from 'maplibre-gl';

export class ImpermeabilisationLayer extends BaseOcsgeLayer {
	constructor(millesimeIndex: number, departement: string, nomenclature: NomenclatureType = "couverture", millesimes: Array<{ index: number; year?: number }> = []) {
		super({
			id: "impermeabilisation-layer",
			type: "fill",
			source: "ocsge-source",
			visible: true,
			opacity: 0.7,
			label: "Imperméabilisation",
			description: "Surfaces imperméabilisées basée sur l'occupation du sol (OCS GE). Seules les zones imperméables sont affichées.",
		}, millesimeIndex, departement, nomenclature, millesimes);
	}

	public getLayerNomenclature() {
		return OCSGE_LAYER_NOMENCLATURES.impermeabilisation;
	}

	getOptions() {
		return this.buildFillOptions(["==", ["get", "is_impermeable"], true]);
	}

	protected getBaseFilter(): FilterSpecification {
		return ["==", ["get", "is_impermeable"], true] as FilterSpecification;
	}

	extractStats(features: maplibregl.MapGeoJSONFeature[]): StatCategory[] {
		return super.extractStats(features, 'is_impermeable');
	}
}
