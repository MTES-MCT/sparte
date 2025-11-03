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

