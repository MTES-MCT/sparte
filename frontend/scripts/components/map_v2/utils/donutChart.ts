export interface DonutSegmentConfig {
    positiveKey: string;
    negativeKey: string;
    positiveColor: string;
    negativeColor: string;
}

export interface DonutSegment {
    value: number;
    isNegative: boolean;
    color: string;
}

export interface DonutChartOptions {
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
    minRadius: 16,
    maxRadius: 42,
    fontSize: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
    },
};

export function createDonutChartFromSegments(
    segments: DonutSegment[],
    options: DonutChartOptions = {}
): HTMLElement | null {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    return createDonutChart(segments, opts);
}

export function createDiffDonutChart(
    data: Record<string, any>,
    config: DonutSegmentConfig,
    options: DonutChartOptions = {}
): HTMLElement | null {
    const segments: DonutSegment[] = [
        {
            value: data[config.positiveKey] || 0,
            isNegative: false,
            color: config.positiveColor
        },
        {
            value: data[config.negativeKey] || 0,
            isNegative: true,
            color: config.negativeColor
        }
    ];
    return createDonutChartFromSegments(segments, options);
}

export function createDonutChart(
    segments: DonutSegment[],
    options: Required<DonutChartOptions>
): HTMLElement | null {
    // Filtrer les segments avec valeur > 0
    const validSegments = segments.filter(s => s.value > 0);

    if (validSegments.length === 0) {
        return null;
    }

    // Calculer le total visuel (somme des valeurs absolues) et le total algébrique
    let visualTotal = 0;
    let algebraicTotal = 0;
    const offsets: number[] = [];

    for (const segment of validSegments) {
        offsets.push(visualTotal);
        visualTotal += segment.value;
        algebraicTotal += segment.isNegative ? -segment.value : segment.value;
    }

    const absoluteTotal = Math.abs(algebraicTotal);

    // Déterminer la taille du donut basée sur le total absolu
    const fontSize = getFontSize(absoluteTotal, options.fontSize);
    const radius = getRadius(absoluteTotal, options.minRadius, options.maxRadius);
    const innerRadius = Math.round(radius * 0.75);
    const width = radius * 2;

    let html = `<div><svg width="${width}" height="${width}" viewBox="0 0 ${width} ${width}" text-anchor="middle" style="font: ${fontSize}px sans-serif; font-weight: bold; display: block">`;

    // Créer les segments visuels
    for (let i = 0; i < validSegments.length; i++) {
        const start = offsets[i] / visualTotal;
        const end = (offsets[i] + validSegments[i].value) / visualTotal;
        html += donutSegment(start, end, radius, innerRadius, validSegments[i].color);
    }

    html += `<circle cx="${radius}" cy="${radius}" r="${innerRadius}" fill="#FFFFFF" />`;

    // Texte principal (total algébrique)
    let totalPrefix = '';
    if (algebraicTotal > 0) {
        totalPrefix = '+';
    } else if (algebraicTotal < 0) {
        totalPrefix = '-';
    }
    const { value: totalValue, unit: totalUnit } = formatDisplayValue(absoluteTotal);
    html += `<text class="donut-main-text" dominant-baseline="central" transform="translate(${radius}, ${radius})" style="font-size: ${fontSize * 0.85}px; font-weight: bold; transition: opacity 0.2s;">${totalPrefix}${totalValue}${totalUnit}</text>`;

    // Textes détaillés des segments
    if (validSegments.length > 1) {
        const textSize = fontSize * 0.75;
        const lineSpacing = textSize * 1.3;
        const totalHeight = lineSpacing * (validSegments.length - 1);
        const startY = radius - totalHeight / 2;

        for (let i = 0; i < validSegments.length; i++) {
            const segment = validSegments[i];
            const { value, unit } = formatDisplayValue(segment.value);
            const prefix = segment.isNegative ? '-' : '+';
            const y = startY + i * lineSpacing;
            html += `<text class="donut-detail-text" dominant-baseline="central" transform="translate(${radius}, ${y})" style="font-size: ${textSize}px; font-weight: bold; fill: ${segment.color}; opacity: 0; transition: opacity 0.2s;">${prefix}${value}${unit}</text>`;
        }
    }

    html += '</svg></div>';

    const element = document.createElement('div');
    element.innerHTML = html;

    // Ajouter les événements hover pour tous les donuts avec plusieurs segments
    if (validSegments.length > 1) {
        const svg = element.querySelector('svg');
        const mainText = element.querySelector('.donut-main-text');
        const detailTexts = element.querySelectorAll('.donut-detail-text');

        if (svg && mainText && detailTexts.length > 0) {
            const handleMouseEnter = () => {
                (mainText as SVGElement).style.opacity = '0';
                for (let i = 0; i < detailTexts.length; i++) {
                    (detailTexts[i] as SVGElement).style.opacity = '1';
                }
            };

            const handleMouseLeave = () => {
                (mainText as SVGElement).style.opacity = '1';
                for (let i = 0; i < detailTexts.length; i++) {
                    (detailTexts[i] as SVGElement).style.opacity = '0';
                }
            };

            svg.addEventListener('mouseenter', handleMouseEnter);
            svg.addEventListener('mouseleave', handleMouseLeave);

            // Stocker les fonctions pour cleanup ultérieur
            (element as any)._donutCleanup = () => {
                svg.removeEventListener('mouseenter', handleMouseEnter);
                svg.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    }

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
