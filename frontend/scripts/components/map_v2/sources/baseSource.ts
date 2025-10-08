import type { BaseSourceOptions } from "../types/source";

export abstract class BaseSource {
    readonly options: BaseSourceOptions;
    loaded = false;

    constructor(options: BaseSourceOptions) {
        this.options = { ...options };
    }

    async load(): Promise<void> {
        this.loaded = true;
    }

    abstract getOptions(): Record<string, any>;
}
