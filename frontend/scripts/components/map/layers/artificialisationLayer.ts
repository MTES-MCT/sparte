import { NomenclatureType } from "../types/ocsge";
import { BaseOcsgeLayer } from "./baseOcsgeLayer";
import { OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";
import type { StatCategory } from "../types/layer";
import type * as maplibregl from 'maplibre-gl';
import type { LandDetailResultType } from "@services/types/land";

export class ArtificialisationLayer extends BaseOcsgeLayer {
	constructor(millesimeIndex: number, departement: string, nomenclature: NomenclatureType = "couverture", millesimes: Array<{ index: number; year?: number }> = [], landData?: LandDetailResultType) {
		super({
			id: "artificialisation-layer",
			type: "fill",
			source: "ocsge-source",
			visible: true,
			opacity: 0.7,
		}, millesimeIndex, departement, nomenclature, millesimes, landData);
	}

	getLayerNomenclature() {
		return OCSGE_LAYER_NOMENCLATURES.artificialisation;
	}

	getOptions() {
		return this.buildFillOptions(["==", ["get", "is_artificial"], true]);
	}

	protected getBaseFilter(): maplibregl.FilterSpecification {
		return ["==", ["get", "is_artificial"], true] as maplibregl.FilterSpecification;
	}

	extractStats(features: maplibregl.MapGeoJSONFeature[]): StatCategory[] {
		return super.extractStats(features, 'is_artificial');
	}
}
