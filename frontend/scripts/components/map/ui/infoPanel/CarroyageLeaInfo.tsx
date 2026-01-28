import React, { useMemo } from "react";
import type maplibregl from "maplibre-gl";
import { InfoContent, InfoRow, InfoLabel, InfoValue } from ".";
import { formatNumber } from "@utils/formatUtils";

type DestinationType = "total" | "habitat" | "activite" | "mixte" | "route" | "ferroviaire" | "inconnu";

const DESTINATION_LABELS: Record<DestinationType, string> = {
    total: "Total",
    habitat: "Habitat",
    activite: "Activité",
    mixte: "Mixte",
    route: "Route",
    ferroviaire: "Ferroviaire",
    inconnu: "Inconnu",
};

interface CarroyageLeaInfoProps {
    feature: maplibregl.MapGeoJSONFeature;
    startYear: number;
    endYear: number;
    selectedDestination: DestinationType;
}

function sumYearsRange(
    props: Record<string, unknown>,
    startYear: number,
    endYear: number,
    suffix: string = ""
): number {
    const minYear = Math.max(startYear, 2011);
    const maxYear = Math.min(endYear, 2023);
    let total = 0;
    for (let year = minYear; year <= maxYear; year++) {
        const key = `conso_${year}${suffix}`;
        const value = props[key];
        if (typeof value === "number") {
            total += value;
        }
    }
    return total;
}

function getYearlyData(
    props: Record<string, unknown>,
    startYear: number,
    endYear: number,
    suffix: string = ""
): { year: number; value: number }[] {
    const minYear = Math.max(startYear, 2011);
    const maxYear = Math.min(endYear, 2023);
    const data: { year: number; value: number }[] = [];
    for (let year = minYear; year <= maxYear; year++) {
        const key = `conso_${year}${suffix}`;
        const value = props[key];
        data.push({
            year,
            value: typeof value === "number" ? value : 0,
        });
    }
    return data;
}

export const CarroyageLeaInfo: React.FC<CarroyageLeaInfoProps> = ({
    feature,
    startYear,
    endYear,
    selectedDestination,
}) => {
    const props = feature.properties || {};

    const formatArea = (value: number | null | undefined) => {
        if (value === null || value === undefined || value === 0) return "0 ha";
        return `${formatNumber({ number: value / 10000, addSymbol: true })} ha`;
    };

    const formatPercent = (value: number, total: number) => {
        if (total === 0) return "0%";
        const percent = (value / total) * 100;
        return `${percent.toFixed(1)}%`;
    };

    const suffix = selectedDestination === "total" ? "" : `_${selectedDestination}`;
    const destinationLabel = DESTINATION_LABELS[selectedDestination];

    const cumulativeTotal = useMemo(
        () => sumYearsRange(props, startYear, endYear, suffix),
        [props, startYear, endYear, suffix]
    );

    const yearlyData = useMemo(
        () => getYearlyData(props, startYear, endYear, suffix),
        [props, startYear, endYear, suffix]
    );

    const displayStartYear = Math.max(startYear, 2011);
    const displayEndYear = Math.min(endYear, 2023);

    return (
        <InfoContent>
            <div>
                <strong className="fr-text--sm">
                    {destinationLabel} - Cumulé {displayStartYear}-{displayEndYear}
                </strong>
            </div>

            <InfoRow>
                <InfoLabel>Total période</InfoLabel>
                <InfoValue><strong>{formatArea(cumulativeTotal)}</strong></InfoValue>
            </InfoRow>

            <div className="fr-mt-2w">
                <strong className="fr-text--sm">Détail par année</strong>
            </div>

            {yearlyData.map(({ year, value }) => {
                const percent = cumulativeTotal > 0 ? (value / cumulativeTotal) * 100 : 0;
                const isHighlight = percent > 10;
                const content = `${formatArea(value)} (${formatPercent(value, cumulativeTotal)})`;
                return (
                    <InfoRow key={year}>
                        <InfoLabel>{year}</InfoLabel>
                        <InfoValue>
                            {isHighlight ? <strong>{content}</strong> : content}
                        </InfoValue>
                    </InfoRow>
                );
            })}
        </InfoContent>
    );
};
