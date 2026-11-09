type FormatNumberOptions = {
  number: number | null | undefined;
  decimals?: number | null;
  useGrouping?: boolean;
  addSymbol?: boolean;
  nullValue?: string;
}

const formatNumber = ({
  number,
  decimals = null,
  useGrouping = true,
  addSymbol = false,
  nullValue = '-',
}: FormatNumberOptions): string => {
  if (number === undefined || number === null || Number.isNaN(number)) {
    return nullValue;
  }

  if (decimals === null) {
    const absNumber = Math.abs(number);
    if (absNumber === 0) {
      decimals = 0;
    } else if (absNumber > 0 && absNumber < 1) {
      decimals = 3;
    } else if (absNumber >= 1 && absNumber < 10) {
      decimals = 2;
    } else if (absNumber >= 10 && absNumber < 100) {
      decimals = 1;
    } else if (absNumber >= 100) {
      decimals = 0;
    }
  }

  const formattedNumber = number.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping,
  });

  if (addSymbol) {
    const symbol = number >= 0 ? '+' : '';
    return `${symbol}${formattedNumber}`;
  }

  return formattedNumber;
}

const formatDateTime = (date: Date, options: Intl.DateTimeFormatOptions = {}): string => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime()) || !Number.isFinite(date.getTime())) {
    return 'Date invalide';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: undefined,
  };

  const finalOptions = { ...defaultOptions, ...options };

  return new Intl.DateTimeFormat('fr-FR', finalOptions).format(date);
}

/**
 * Gère le pluriel d'un mot en fonction d'un nombre
 * @param count - Le nombre pour déterminer le pluriel
 * @param singular - La forme singulière du mot
 * @param plural - La forme plurielle personnalisée (optionnel, par défaut ajoute 's')
 * @returns Le mot au singulier ou au pluriel selon le nombre
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
  const pluralForm = plural || (singular ? singular.replace(/\S+/g, (word) => `${word}s`) : 's');
    return count > 1 ? pluralForm : singular;
};

/**
 * 1er janvier d'une année, en forme courte : début d'une année de données de
 * consommation, ou date d'un stock annuel (population, ménages, emplois).
 */
export const formatFirstJanuary = (year: number): string => `1er janv. ${year}`;

/**
 * Fin d'une période de consommation dont la dernière année incluse est `year` :
 * une période « de 2011 à 2020 » s'arrête au 1er janvier 2021.
 */
export const formatConsoYearEnd = (year: number): string => formatFirstJanuary(year + 1);

/** Période de consommation en toutes lettres, par ex. « du 1er janvier 2011 au 1er janvier 2021 ». */
export const formatConsoPeriodLong = (startYear: number, endYear: number): string =>
  `du 1er janvier ${startYear} au 1er janvier ${endYear + 1}`;

export { formatNumber, formatDateTime };
