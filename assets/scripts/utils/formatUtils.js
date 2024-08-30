const formatNumber = (number, decimals = 0, useGrouping = true) => number.toLocaleString('fr-FR', {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
  useGrouping,
})

const formatDateTime = (date, options = {}) =>
{
  if (!(date instanceof Date) || Number.isNaN(date.getTime()) || !Number.isFinite(date.getTime()))
  {
    return 'Date invalide'
  }

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: undefined,
  }

  const finalOptions = { ...defaultOptions, ...options }

  return new Intl.DateTimeFormat('fr-FR', finalOptions).format(date)
}

export { formatNumber, formatDateTime }
