type FormatNumberOptions = {
  number: number;
  decimals?: number | null;
  useGrouping?: boolean;
  addSymbol?: boolean;
}

const formatNumber = ({
  number,
  decimals = null,
  useGrouping = true,
  addSymbol = false,
}: FormatNumberOptions): string => {

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

export { formatNumber, formatDateTime };
