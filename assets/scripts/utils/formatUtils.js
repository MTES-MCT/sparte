const formatNumber = (number, decimals = 0, useGrouping = true) => number.toLocaleString('fr-FR', {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
  useGrouping,
})

export default formatNumber
