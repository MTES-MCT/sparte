export const getColor = () => {
    let letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++)
        color += letters[Math.floor(Math.random() * 16)]
    return color
}

export const polyStyle = (feature) => {
    return {
        fillColor: getColor(feature),
        fillOpacity: 0.5,
        weight: 1,
        opacity: 0.1,
        color: 'white',
    }
}

export const slugify = str =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
