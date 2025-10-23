import {
    IMPERMEABILISATION_COLOR,
    DESIMPERMEABILISATION_COLOR,
    ARTIFICIALISATION_COLOR,
    DESARTIFICIALISATION_COLOR
} from "../constants/config";

export interface DonutChartData {
    impermeabilisation_count: number;
    desimpermeabilisation_count: number;
}

export interface ArtificialisationDonutChartData {
    artificialisation_count: number;
    desartificialisation_count: number;
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
    minRadius: 18,
    maxRadius: 50,
    fontSize: {
        small: 16,
        medium: 18,
        large: 20,
        xlarge: 22,
    },
};

const ARTIFICIALISATION_DEFAULT_OPTIONS: Required<DonutChartOptions> = {
    colors: {
        impermeabilisation: ARTIFICIALISATION_COLOR,
        desimpermeabilisation: DESARTIFICIALISATION_COLOR,
    },
    minRadius: 18,
    maxRadius: 50,
    fontSize: {
        small: 16,
        medium: 18,
        large: 20,
        xlarge: 22,
    },
};

/**
 * Crée un donut chart SVG pour afficher les données d'imperméabilisation/désimperméabilisation
 */
export function createImpermeabilisationDonutChart(
    data: DonutChartData,
    options: DonutChartOptions = {}
): HTMLElement {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const counts = [
        data.impermeabilisation_count,
        data.desimpermeabilisation_count,
    ];

    const colors = [
        opts.colors.impermeabilisation,
        opts.colors.desimpermeabilisation,
    ];

    return createDonutChart(counts, colors, opts);
}

/**
 * Crée un donut chart SVG pour afficher les données d'artificialisation/désartificialisation
 */
export function createArtificialisationDonutChart(
    data: ArtificialisationDonutChartData,
    options: DonutChartOptions = {}
): HTMLElement {
    const opts = { ...ARTIFICIALISATION_DEFAULT_OPTIONS, ...options };

    const counts = [
        data.artificialisation_count,
        data.desartificialisation_count,
    ];

    const colors = [
        opts.colors.impermeabilisation, // Réutilise la structure mais avec les couleurs d'artificialisation
        opts.colors.desimpermeabilisation,
    ];

    return createDonutChart(counts, colors, opts);
}

/**
 * Crée un donut chart SVG générique
 */
export function createDonutChart(
    counts: number[],
    colors: string[],
    options: Required<DonutChartOptions>
): HTMLElement {
    const offsets: number[] = [];
    let total = 0;

    // Calculer les offsets pour chaque segment
    for (let i = 0; i < counts.length; i++) {
        offsets.push(total);
        total += counts[i];
    }

    // Si aucun point, créer un cercle vide
    if (total === 0) {
        return createEmptyDonut(options);
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

    // Cercle central blanc avec le total
    html += `<circle cx="${radius}" cy="${radius}" r="${innerRadius}" fill="white" />`;
    html += `<text dominant-baseline="central" transform="translate(${radius}, ${radius})">${total.toLocaleString()}</text>`;
    html += '</svg></div>';

    const element = document.createElement('div');
    element.innerHTML = html;
    return element.firstChild as HTMLElement;
}

/**
 * Crée un donut vide quand il n'y a pas de données
 */
function createEmptyDonut(options: Required<DonutChartOptions>): HTMLElement {
    const radius = options.minRadius;
    const width = radius * 2;

    const html = `<div><svg width="${width}" height="${width}" viewBox="0 0 ${width} ${width}" text-anchor="middle" style="font: ${options.fontSize.small}px sans-serif; display: block">
        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#e0e0e0" stroke="#ccc" stroke-width="2" />
        <text dominant-baseline="central" transform="translate(${radius}, ${radius})" fill="#666">0</text>
    </svg></div>`;

    const element = document.createElement('div');
    element.innerHTML = html;
    return element.firstChild as HTMLElement;
}

/**
 * Détermine la taille de police basée sur le total
 */
function getFontSize(total: number, fontSize: DonutChartOptions['fontSize']): number {
    if (!fontSize) return 16;

    if (total >= 1000) return fontSize.xlarge;
    if (total >= 100) return fontSize.large;
    if (total >= 10) return fontSize.medium;
    return fontSize.small;
}

/**
 * Détermine le rayon basé sur le total
 */
function getRadius(total: number, minRadius: number, maxRadius: number): number {
    if (total >= 1000) return maxRadius;
    if (total >= 100) return Math.round(maxRadius * 0.64); // 32 pour maxRadius=50
    if (total >= 10) return Math.round(maxRadius * 0.48);  // 24 pour maxRadius=50
    return minRadius;
}

/**
 * Crée un segment de donut
 */
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
