import type { ZonageUrbanismeMode } from "../layers/zonageUrbanismeLayer";

interface ModeConfig {
	layerType: "artificialisation" | "impermeabilisation";
	gradientColor: string;
	label: string;
	labelCap: string;
	desLabel: string;
	nonArtifLabel: string;
	mapLabel: string;
	mapDescription: string;
	ocsgeLabel: string;
	ocsgeDescription: string;
	chartDescription: string;
	matrixLabelPositif: string;
	matrixLabelNegatif: string;
	props: {
		percent: string;
		surface: string;
		couvertureComposition: string;
		usageComposition: string;
		flux: string;
		fluxDes: string;
		fluxNet: string;
		fluxCouvertureComposition: string;
		fluxUsageComposition: string;
	};
}

const ARTIF_CONFIG: ModeConfig = {
	layerType: "artificialisation",
	gradientColor: "#FA4B42",
	label: "artificialisation",
	labelCap: "Artificialisation",
	desLabel: "Désartificialisation",
	nonArtifLabel: "Non artificialisé",
	mapLabel: "Zonages d'urbanisme — Artificialisation",
	mapDescription: "Cette carte affiche les zonages d'urbanisme (PLU) avec l'occupation du sol artificialisée visible au survol.",
	ocsgeLabel: "Occupation du sol artificialisée",
	ocsgeDescription: "Ce calque affiche les objets OCS GE classés comme artificialisés, colorés selon la nomenclature sélectionnée.",
	chartDescription: "Qualifier l'artificialisation de chaque parcelle OCS GE via la matrice d'artificialisation. Puis croiser les parcelles avec les zonages d'urbanisme (PLU/GPU) pour mesurer le taux d'artificialisation de chaque zone.",
	matrixLabelPositif: "Artificialisé",
	matrixLabelNegatif: "Non artificialisé",
	props: {
		percent: "artif_percent",
		surface: "artif_surface",
		couvertureComposition: "artif_couverture_composition",
		usageComposition: "artif_usage_composition",
		flux: "flux_artif",
		fluxDes: "flux_desartif",
		fluxNet: "flux_artif_net",
		fluxCouvertureComposition: "flux_artif_couverture_composition",
		fluxUsageComposition: "flux_artif_usage_composition",
	},
};

const IMPER_CONFIG: ModeConfig = {
	layerType: "impermeabilisation",
	gradientColor: "#3A7EC2",
	label: "imperméabilisation",
	labelCap: "Imperméabilisation",
	desLabel: "Désimperméabilisation",
	nonArtifLabel: "Non imperméabilisé",
	mapLabel: "Zonages d'urbanisme — Imperméabilisation",
	mapDescription: "Cette carte affiche les zonages d'urbanisme (PLU) avec l'occupation du sol imperméable visible au survol.",
	ocsgeLabel: "Occupation du sol imperméabilisée",
	ocsgeDescription: "Ce calque affiche les objets OCS GE classés comme imperméables, colorés selon la nomenclature sélectionnée.",
	chartDescription: "Qualifier l'imperméabilisation de chaque parcelle OCS GE via la nomenclature OCS GE. Puis croiser les parcelles avec les zonages d'urbanisme (PLU/GPU) pour mesurer le taux d'imperméabilisation de chaque zone.",
	matrixLabelPositif: "Imperméable",
	matrixLabelNegatif: "Non imperméable",
	props: {
		percent: "imper_percent",
		surface: "imper_surface",
		couvertureComposition: "imper_couverture_composition",
		usageComposition: "imper_usage_composition",
		flux: "flux_imper",
		fluxDes: "flux_desimper",
		fluxNet: "flux_imper_net",
		fluxCouvertureComposition: "flux_imper_couverture_composition",
		fluxUsageComposition: "flux_imper_usage_composition",
	},
};

export const MODE_CONFIG: Record<ZonageUrbanismeMode, ModeConfig> = {
	artif: ARTIF_CONFIG,
	imper: IMPER_CONFIG,
};
