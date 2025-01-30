import { Couverture, couvertures, Usage } from "./cs_and_us"

export type RGBColor = [number, number, number]

export type CouvertureColors = {
    [key in Couverture]: RGBColor
} 

export const couvertureColors: CouvertureColors = {
    "CS1.1.1.1": [255, 55, 122],
    "CS1.1.1.2": [255, 145, 145],
    "CS1.1.2.1": [255, 255, 153],
    "CS1.1.2.2": [166, 77, 0],
    "CS1.2.1": [204, 204, 204],
    "CS1.2.2": [0, 204, 242],
    "CS1.2.3": [166, 230, 204],
    "CS2.1.1.1": [128, 255, 0],
    "CS2.1.1.2": [0, 166, 0],
    "CS2.1.1.3": [128, 190, 0],
    "CS2.1.2": [166, 255, 128],
    "CS2.1.3": [230, 128, 0],
    "CS2.2.1": [204, 242, 77],
}

export type UsageColors = {
    [key in Usage]: RGBColor
}

export const usageColors: UsageColors = {
    "US1.1": [255, 255, 168],
    "US1.2": [0, 128, 0],
    "US1.3": [166, 0, 204],
    "US1.4": [0, 0, 153],
    "US2": [230, 0, 77],
    "US235": [230, 0, 77],
    "US3": [255, 140, 0],
    "US4.1.1": [204, 0, 0],
    "US4.1.2": [90, 90, 90],
    "US4.1.3": [230, 204, 230],
    "US4.1.4": [0, 102, 255],
    "US4.1.5": [102, 0, 51],
    "US4.2": [255, 0, 0],
    "US4.3": [255, 75, 0],
    "US5": [190, 9, 97],
    "US6.1": [255, 77, 255],
    "US6.2": [64, 64, 64],
    "US6.3": [240, 240, 40],
    "US6.6": [255, 204, 0],
}

export const getUsageColor = (usage: Usage): RGBColor => {
    return usageColors[usage];
}

export const getUsageColorAsRGBString = (usage: Usage): string => {
    return `rgba(${usageColors[usage].join(", ")})`
}

export const getCouvertureColor = (couverture: Couverture): RGBColor => {
    return couvertureColors[couverture];
}

export const getCouvertureColorAsRGBString = (couverture: Couverture): string => {
    return `rgba(${couvertureColors[couverture].join(", ")})`
}

export const getCouvertureOrUsageAsRGBString = (couvertureOrUsage: Couverture | Usage): string => {
    if (couvertures.includes(couvertureOrUsage as Couverture)) {
        return getCouvertureColorAsRGBString(couvertureOrUsage as Couverture);
    } else {
        return getUsageColorAsRGBString(couvertureOrUsage as Usage);
    }
}

export const getCombinedColor = (couverture: Couverture, usage: Usage): RGBColor => {
    const couvertureColor = getCouvertureColor(couverture);
    const usageColor = getUsageColor(usage);
    return couvertureColor.map((value, index) => Math.round((value + usageColor[index]) / 2)) as [number, number, number];
}