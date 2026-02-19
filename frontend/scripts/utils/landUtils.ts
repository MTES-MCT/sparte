const CODE_TO_SLUG: Record<string, string> = {
	'COMM': 'commune',
	'EPCI': 'epci',
	'DEPART': 'departement',
	'REGION': 'region',
	'SCOT': 'scot',
	'NATION': 'nation',
};

export const landTypeCodeToSlug = (code: string): string => {
	return CODE_TO_SLUG[code] || code.toLowerCase();
};

export const getLandTypeLabel = (
	landType: string | undefined | null,
	plural: boolean = false
): string => {
	if (!landType) {
		return '';
	}

	const labels: Record<string, string> = {
		'COMM': 'commune',
		'EPCI': 'EPCI',
		'DEPART': 'département',
		'REGION': 'région',
		'SCOT': 'SCoT',
		'NAT': 'national',
	};

	const label = labels[landType] || landType.toLowerCase();

	if (plural) {
		return `${label}s`;
	}

	return label;
};

