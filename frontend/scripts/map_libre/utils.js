export function debounce(func, timeout = 300)
{
  let timer
  return (...args) =>
  {
    clearTimeout(timer)
    timer = setTimeout(() =>
    {
      func.apply(this, args)
    }, timeout)
  }
}

export function slugify(str)
{
  str = str.replace(/^\s+|\s+$/g, '')

  // Make the string lowercase
  str = str.toLowerCase()

  // Remove accents, swap ñ for n, etc
  const from = 'ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;'
  const to = 'AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------'
  for (let i = 0, l = from.length; i < l; i++)
  {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  // Remove invalid chars
  str = str.replace(/[^a-z0-9 -]/g, '')
  // Collapse whitespace and replace by -
    .replace(/\s+/g, '-')
  // Collapse dashes
    .replace(/-+/g, '-')

  return str
}

export function isEmpty(_value)
{
  return _value === undefined || _value === null || Number.isNaN(_value) || (typeof _value === 'object' && Object.keys(_value).length === 0) || (typeof _value === 'string' && _value.trim().length === 0)
}

export function formatData(type, _options, _value)
{
  const formatter = {
    number: () => new Intl.NumberFormat(_options[0], { style: _options[1], unit: _options[2], maximumFractionDigits: _options[3] }).format(_value),
  }

  return formatter[type]?.(_options) ?? 'formatter not found'
}

export function isInRange(num, low, high)
{
  if (num >= low && num <= high)
  {
    return true
  }

  return false
}

function donutSegment(start, end, r, r0, color)
{
  if (end - start === 1) end -= 0.00001
  const a0 = 2 * Math.PI * (start - 0.25)
  const a1 = 2 * Math.PI * (end - 0.25)
  const x0 = Math.cos(a0)
  const y0 = Math.sin(a0)
  const x1 = Math.cos(a1)
  const y1 = Math.sin(a1)
  const largeArc = end - start > 0.5 ? 1 : 0

  // draw an SVG path
  return `<path d="M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${
    r + r * y0
  } A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1} L ${
    r + r0 * x1
  } ${r + r0 * y1} A ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${
    r + r0 * y0
  }" fill="${color}" />`
}

export function createDonutChart(colors, counts, formatter)
{
  const offsets = []

  let total = 0
  counts.forEach((count) =>
  {
    offsets.push(total)
    total += count
  })
  const fontSize = total >= 100 ? 12 : total >= 10 ? 10 : total >= 1 ? 9 : 8
  const r = total >= 100 ? 50 : total >= 10 ? 32 : total >= 1 ? 24 : 18
  const r0 = Math.round(r * 0.6)
  const w = r * 2

  let html = `<div style="cursor:pointer;"><svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" text-anchor="middle" style="font: ${fontSize}px sans-serif; display: block">`

  for (let i = 0; i < counts.length; i++)
  {
    html += donutSegment(
      offsets[i] / total,
      (offsets[i] + counts[i]) / total,
      r,
      r0,
      colors[i],
    )
  }
  html += `<circle cx="${r}" cy="${r}" r="${r0}" fill="white" /><text dominant-baseline="central" transform="translate(${r}, ${r})">${formatData(formatter[0], formatter[1], total)}</text></svg></div>`

  const el = document.createElement('div')
  el.innerHTML = html
  return el.firstChild
}
