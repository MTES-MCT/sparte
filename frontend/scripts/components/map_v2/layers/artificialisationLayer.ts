import { BaseLayer } from "./baseLayer";
import { NomenclatureType } from "../types/ocsge";
import { COUVERTURE_COLORS, USAGE_COLORS } from "../constants/ocsge_colors";

export class ArtificialisationLayer extends BaseLayer {
	private millesimeIndex: number;
	private departement: string;
	private nomenclature: NomenclatureType;

	constructor(millesimeIndex: number, departement: string, nomenclature: NomenclatureType = "couverture") {
		super({
			id: "artificialisation-layer",
			type: "fill",
			source: "ocsge-source",
			visible: true,
			opacity: 0.7,
		});

		this.millesimeIndex = millesimeIndex;
		this.departement = departement;
		this.nomenclature = nomenclature;
	}

	private getColorExpression() {
		const field = this.nomenclature === "couverture" ? "code_cs" : "code_us";
		const colors = this.nomenclature === "couverture" ? COUVERTURE_COLORS : USAGE_COLORS;

		const cases = Object.entries(colors).map(([key, color]) => [
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

	getOptions() {
		const sourceLayer = `occupation_du_sol_${this.millesimeIndex}_${this.departement}`;

		return {
			...this.options,
			"source-layer": sourceLayer,
			filter: ["==", ["get", "is_artificial"], true],
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
}
