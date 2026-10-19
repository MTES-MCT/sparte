import { BaseMillesimeVectorSource } from "./baseMillesimeVectorSource";
import type { LandDetailResultType } from "@services/types/land";

export class ZonageUrbanismeSource extends BaseMillesimeVectorSource {
	constructor(landData: LandDetailResultType) {
		super("zonage-urbanisme-source", landData, "zonage_urbanisme");
	}
}
