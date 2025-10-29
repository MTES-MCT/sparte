import type { NomenclatureType, Couverture, Usage } from "./ocsge";
export type LayerInterface = {
    getId?(): string;
    getSource?(): string;
    getOpacity?(): number;
    setOpacity?(opacity: number): void;
    getVisibility?(): boolean;
    setVisibility?(visible: boolean): void;
    getCurrentMillesime?(): number;
    getCurrentDepartement?(): string;
    getAvailableMillesimes?(): Array<{ value: string; label: string }>;
    getCurrentNomenclature?(): NomenclatureType;
    setNomenclature?(value: NomenclatureType): Promise<void>;
    getLayerNomenclature?(): { couverture: Couverture[]; usage: Usage[] };
    getCurrentFilter?(): string[];
    setFilter?(codes: string[]): Promise<void>;
    getStartMillesimeIndex?(): number;
    getEndMillesimeIndex?(): number;
    getDepartement?(): string;
};

