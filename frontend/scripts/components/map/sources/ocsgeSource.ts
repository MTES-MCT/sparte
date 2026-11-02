import { BaseMillesimeVectorSource } from "./baseMillesimeVectorSource";
import type { LandDetailResultType } from "@services/types/land";

export class OcsgeSource extends BaseMillesimeVectorSource {
	constructor(landData: LandDetailResultType) {
		super("ocsge-source", landData, "occupation_du_sol");
	}
}
