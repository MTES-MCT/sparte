import { BaseSource } from "./baseSource";
import { OCSGE_TILES_URL } from "../constants/config";
import { Millesime } from "@services/types/land";
import type { SourceInterface } from "../types/sourceInterface";
import type { SourceSpecification, LayerSpecification } from "maplibre-gl";

const getLastMillesimeIndex = (millesimes: Millesime[]): number => {
    if (!millesimes || millesimes.length === 0) {
        return 1;
    }

    return Math.max(...millesimes.map(m => m.index));
};

export class OcsgeDiffSource extends BaseSource implements SourceInterface {
    private startMillesimeIndex: number;
    private endMillesimeIndex: number;
    private departement: string;
    private millesimes: Millesime[];
    private departements: string[];

    constructor(millesimes: Millesime[], departements: string[], startMillesimeIndex?: number, endMillesimeIndex?: number) {
        super({
            id: "ocsge-diff-source",
            type: "vector",
        });

        this.millesimes = millesimes;
        this.departements = departements;

        // Par défaut, utiliser les deux derniers millésimes consécutifs
        const lastIndex = getLastMillesimeIndex(millesimes);
        this.endMillesimeIndex = endMillesimeIndex ?? lastIndex;
        this.startMillesimeIndex = startMillesimeIndex ?? (lastIndex > 1 ? lastIndex - 1 : lastIndex);

        // Vérifier que les millésimes sont consécutifs
        if (this.endMillesimeIndex - this.startMillesimeIndex !== 1) {
            throw new Error("Les millésimes doivent être consécutifs pour la source de différence OCSGE");
        }

        const millesime = millesimes.find((m: Millesime) => m.index === this.endMillesimeIndex);
        this.departement = millesime?.departement || departements[0];
    }

    getOptions(): SourceSpecification {
        const tilesUrl = `${OCSGE_TILES_URL}occupation_du_sol_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.pmtiles`;

        return {
            type: this.options.type as 'vector',
            url: `pmtiles://${tilesUrl}`,
        } as SourceSpecification;
    }

    async setMillesimes(newStartIndex: number, newEndIndex: number): Promise<void> {
        if (!this.map || !this.sourceId) {
            console.warn('OcsgeDiffSource: map ou sourceId non attaché');
            return;
        }

        // Vérifier que les millésimes sont consécutifs
        if (newEndIndex - newStartIndex !== 1) {
            throw new Error("Les millésimes doivent être consécutifs pour la source de différence OCSGE");
        }

        if (this.startMillesimeIndex === newStartIndex && this.endMillesimeIndex === newEndIndex) return;

        // Mettre à jour les index et le département
        this.startMillesimeIndex = newStartIndex;
        this.endMillesimeIndex = newEndIndex;
        const millesime = this.millesimes.find((m: Millesime) => m.index === this.endMillesimeIndex);
        this.departement = millesime?.departement || this.departements[0];

        // Trouver toutes les layers qui utilisent cette source et sauvegarder leurs specs
        const style = this.map.getStyle();
        const layerSpecs = style.layers
            .filter((l): l is LayerSpecification => {
                if (!('source' in l)) return false;
                const layerSource = (l as { source?: string }).source;
                return layerSource === this.sourceId;
            })
            .map((l): LayerSpecification => {
                // Créer une copie propre du spec de la layer (sans les propriétés internes)
                const { id, type, minzoom, maxzoom, layout, paint } = l;
                const source = (l as { source?: string }).source;
                const filter = (l as { filter?: unknown }).filter;
                const sourceLayer = 'source-layer' in l ? l['source-layer'] : undefined;

                // Mettre à jour le source-layer avec les nouveaux millésimes si c'est un layer OCSGE diff
                let updatedSourceLayer = sourceLayer;
                if (sourceLayer && typeof sourceLayer === 'string' && sourceLayer.startsWith('occupation_du_sol_diff_')) {
                    // Remplacer les anciens index de millésime par les nouveaux dans le nom du source-layer
                    updatedSourceLayer = `occupation_du_sol_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}`;
                }

                return {
                    id,
                    type,
                    source,
                    ...(updatedSourceLayer && { 'source-layer': updatedSourceLayer }),
                    ...(minzoom !== undefined && { minzoom }),
                    ...(maxzoom !== undefined && { maxzoom }),
                    ...(filter && { filter }),
                    ...(layout && { layout }),
                    ...(paint && { paint })
                } as LayerSpecification;
            });

        // 1. Supprimer les layers
        layerSpecs.forEach(({ id }) => {
            if (this.map!.getLayer(id)) {
                this.map!.removeLayer(id);
            }
        });

        // 2. Supprimer la source
        if (this.map.getSource(this.sourceId)) {
            this.map.removeSource(this.sourceId);
        }

        // 3. Recréer la source avec la nouvelle URL
        const newOptions = this.getOptions();
        this.map.addSource(this.sourceId, newOptions);

        // 4. Recréer les layers avec leurs specs propres
        layerSpecs.forEach((layerSpec) => {
            this.map!.addLayer(layerSpec);
        });
    }

    getAvailableMillesimePairs(): Array<{ startIndex: number; endIndex: number; startYear?: number; endYear?: number }> {
        const pairs: Array<{ startIndex: number; endIndex: number; startYear?: number; endYear?: number }> = [];

        // Trier les millésimes par index
        const sortedMillesimes = [...this.millesimes].sort((a, b) => a.index - b.index);

        // Créer des paires consécutives
        for (let i = 0; i < sortedMillesimes.length - 1; i++) {
            const current = sortedMillesimes[i];
            const next = sortedMillesimes[i + 1];

            if (next.index - current.index === 1) {
                pairs.push({
                    startIndex: current.index,
                    endIndex: next.index,
                    startYear: current.year,
                    endYear: next.year
                });
            }
        }

        return pairs;
    }

    getStartMillesimeIndex(): number {
        return this.startMillesimeIndex;
    }

    getEndMillesimeIndex(): number {
        return this.endMillesimeIndex;
    }

    getDepartement(): string {
        return this.departement;
    }

    getId(): string {
        return this.options.id;
    }
}
