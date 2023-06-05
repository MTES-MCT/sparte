export function debounce(func, timeout = 300) {
	let timer
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => { func.apply(this, args) }, timeout)
	}
}


export function slugify(str) {
	str = str.replace(/^\s+|\s+$/g, '')

	// Make the string lowercase
	str = str.toLowerCase()

	// Remove accents, swap ñ for n, etc
	var from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;"
	var to = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------"
	for (var i = 0, l = from.length; i < l; i++) {
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

export function isEmpty(_value) {
	return _value === undefined ||
		_value === null ||
		_value === NaN ||
		(typeof _value === "object" && Object.keys(_value).length === 0) ||
		(typeof _value === "string" && _value.trim().length === 0)
}

export function formatData(_type, _options, _value) {
	const formatter = {
		"number": (_options) => new Intl.NumberFormat(_options[0], { style: _options[1], unit: _options[2], maximumFractionDigits: _options[3] }).format(_value)
	}

	return formatter[_type]?.(_options) ?? "formatter not found"
}
