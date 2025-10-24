import {
    IMPERMEABILISATION_COLOR,
    DESIMPERMEABILISATION_COLOR,
    ARTIFICIALISATION_COLOR,
    DESARTIFICIALISATION_COLOR
} from "../constants/config";

export type DiffType = 'impermeabilisation' | 'artificialisation';

export interface DonutChartData {
    impermeabilisation_count: number;
    desimpermeabilisation_count: number;
}

export interface ArtificialisationDonutChartData {
    artificialisation_count: number;
    desartificialisation_count: number;
}

export interface GenericDonutChartData {
    positiveCount: number;
    negativeCount: number;
}

export interface DonutChartOptions {
    colors?: {
        impermeabilisation: string;
        desimpermeabilisation: string;
    };
    minRadius?: number;
    maxRadius?: number;
    fontSize?: {
        small: number;
        medium: number;
        large: number;
        xlarge: number;
    };
}

const DEFAULT_OPTIONS: Required<DonutChartOptions> = {
    colors: {
        impermeabilisation: IMPERMEABILISATION_COLOR,
        desimpermeabilisation: DESIMPERMEABILISATION_COLOR,
    },
    minRadius: 14,
    maxRadius: 40,
    fontSize: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
    },
};

export function createDiffDonutChart(
    data: GenericDonutChartData,
    type: DiffType,
    options: DonutChartOptions = {}
): HTMLElement | null {
    const colorConfig = type === 'impermeabilisation'
        ? { positive: IMPERMEABILISATION_COLOR, negative: DESIMPERMEABILISATION_COLOR }
        : { positive: ARTIFICIALISATION_COLOR, negative: DESARTIFICIALISATION_COLOR };

    const opts = {
        ...DEFAULT_OPTIONS,
        colors: {
            impermeabilisation: colorConfig.positive,
            desimpermeabilisation: colorConfig.negative,
        },
        ...options
    };

    const counts = [data.positiveCount, data.negativeCount];
    const colors = [colorConfig.positive, colorConfig.negative];

    return createDonutChart(counts, colors, opts);
}

export function createImpermeabilisationDonutChart(
    data: DonutChartData,
    options: DonutChartOptions = {}
): HTMLElement | null {
    return createDiffDonutChart(
        {
            positiveCount: data.impermeabilisation_count,
            negativeCount: data.desimpermeabilisation_count
        },
        'impermeabilisation',
        options
    );
}

export function createArtificialisationDonutChart(
    data: ArtificialisationDonutChartData,
    options: DonutChartOptions = {}
): HTMLElement | null {
    return createDiffDonutChart(
        {
            positiveCount: data.artificialisation_count,
            negativeCount: data.desartificialisation_count
        },
        'artificialisation',
        options
    );
}

export function createDonutChart(
    counts: number[],
    colors: string[],
    options: Required<DonutChartOptions>
): HTMLElement | null {
    const offsets: number[] = [];
    let total = 0;

    // Calculer les offsets pour chaque segment
    for (const count of counts) {
        offsets.push(total);
        total += count;
    }

    if (total === 0) {
        return null;
    }

    // Déterminer la taille du donut basée sur le total
    const fontSize = getFontSize(total, options.fontSize);
    const radius = getRadius(total, options.minRadius, options.maxRadius);
    const innerRadius = Math.round(radius * 0.6);
    const width = radius * 2;

    let html = `<div><svg width="${width}" height="${width}" viewBox="0 0 ${width} ${width}" text-anchor="middle" style="font: ${fontSize}px sans-serif; display: block">`;

    // Créer chaque segment du donut
    for (let i = 0; i < counts.length; i++) {
        if (counts[i] > 0) {
            const start = offsets[i] / total;
            const end = (offsets[i] + counts[i]) / total;
            html += donutSegment(start, end, radius, innerRadius, colors[i]);
        }
    }

    // Cercle central blanc avec le total (affiché en hectares si c'est une surface)
    html += `<circle cx="${radius}" cy="${radius}" r="${innerRadius}" fill="white" />`;
    // Convertir et formater la valeur
    const { value, unit } = formatDisplayValue(total);
    html += `<text dominant-baseline="central" transform="translate(${radius}, ${radius})">${value}${unit}</text>`;
    html += '</svg></div>';

    const element = document.createElement('div');
    element.innerHTML = html;
    return element;
}

function convertToHectares(squareMeters: number): number {
    return squareMeters / 10000;
}

function formatDisplayValue(total: number): { value: string; unit: string } {
    const hectares = convertToHectares(total);
    const decimals = hectares < 1 ? 2 : 1;
    return {
        value: hectares.toFixed(decimals),
        unit: 'ha'
    };
}

function getFontSize(total: number, fontSize: DonutChartOptions['fontSize']): number {
    if (!fontSize) return 16;

    const valueInHa = convertToHectares(total);

    if (valueInHa >= 100) return fontSize.xlarge;
    if (valueInHa >= 10) return fontSize.large;
    if (valueInHa >= 1) return fontSize.medium;
    return fontSize.small;
}

function getRadius(total: number, minRadius: number, maxRadius: number): number {
    const valueInHa = convertToHectares(total);

    const minValue = 0.01; // 0.01 hectare
    const maxValue = 100;   // 100 hectares

    const clampedValue = Math.max(minValue, Math.min(maxValue, valueInHa));

    const logMin = Math.log10(minValue);
    const logMax = Math.log10(maxValue);
    const logValue = Math.log10(clampedValue);

    const ratio = (logValue - logMin) / (logMax - logMin);
    const radius = minRadius + (maxRadius - minRadius) * ratio;

    return Math.round(radius);
}

function donutSegment(
    start: number,
    end: number,
    outerRadius: number,
    innerRadius: number,
    color: string
): string {
    if (end - start === 1) end -= 0.00001;

    const a0 = 2 * Math.PI * (start - 0.25);
    const a1 = 2 * Math.PI * (end - 0.25);
    const x0 = Math.cos(a0);
    const y0 = Math.sin(a0);
    const x1 = Math.cos(a1);
    const y1 = Math.sin(a1);
    const largeArc = end - start > 0.5 ? 1 : 0;

    return [
        '<path d="M',
        outerRadius + innerRadius * x0,
        outerRadius + innerRadius * y0,
        'L',
        outerRadius + outerRadius * x0,
        outerRadius + outerRadius * y0,
        'A',
        outerRadius,
        outerRadius,
        0,
        largeArc,
        1,
        outerRadius + outerRadius * x1,
        outerRadius + outerRadius * y1,
        'L',
        outerRadius + innerRadius * x1,
        outerRadius + innerRadius * y1,
        'A',
        innerRadius,
        innerRadius,
        0,
        largeArc,
        0,
        outerRadius + innerRadius * x0,
        outerRadius + innerRadius * y0,
        `" fill="${color}" />`
    ].join(' ');
}
