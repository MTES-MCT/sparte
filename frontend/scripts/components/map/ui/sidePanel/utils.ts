import type { CompositionItem } from "./types";

export function parseComposition(raw: unknown): CompositionItem[] {
	if (!raw) return [];
	try {
		const data = typeof raw === "string" ? JSON.parse(raw) : raw;
		if (!Array.isArray(data)) return [];
		return data as CompositionItem[];
	} catch {
		return [];
	}
}

export function getFluxNetColor(value: number): string | undefined {
	if (value > 0) return "#E63946";
	if (value < 0) return "#2A9D8F";
	return undefined;
}
