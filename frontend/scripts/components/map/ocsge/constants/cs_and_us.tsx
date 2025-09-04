export const couvertures = [
    "CS1.1.1.1",
    "CS1.1.1.2",
    "CS1.1.2.1",
    "CS1.1.2.2",
    "CS1.2.1",
    "CS1.2.2",
    "CS1.2.3",
    "CS2.1.1.1",
    "CS2.1.1.2",
    "CS2.1.1.3",
    "CS2.1.2",
    "CS2.1.3",
    "CS2.2.1",
    "CS2.2.2",
] as const
export type Couverture = typeof couvertures[number]

export const usages = [
    "US1.1",
    "US1.2",
    "US1.3",
    "US1.4",
    "US2",
    "US235",
    "US3",
    "US4.1.1",
    "US4.1.2",
    "US4.1.3",
    "US4.1.4",
    "US4.1.5",
    "US4.2",
    "US4.3",
    "US5",
    "US6.1",
    "US6.2",
    "US6.3",
    "US6.6",
] as const

export type Usage = typeof usages[number]