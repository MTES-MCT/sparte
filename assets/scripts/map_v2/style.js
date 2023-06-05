import layerStyles from './layers-style.json'

export default class Style {
    constructor(_options = {}) {
        this.sparteMap = window.sparteMap
        this.styleKey = _options.styleKey
        this.feature = _options.feature
        this.couv_leafs = this.sparteMap.couv_leafs
        this.usa_leafs = this.sparteMap.usa_leafs

        this.setStyle()
        this.setHighlight()
    }

    // TODO => refactoring after poc
    setStyle() {
        // Default style
        this.style = this.getStyle(this.styleKey)

        // Override Style
        if (this.styleKey === 'style_zone_urbaines') {
            if (['U'].includes(this.feature.properties.typezone))
                this.style = { ...this.style, ...this.getStyle('style_zone_urbaines__u') }
            else if (['AUc', 'AUs'].includes(this.feature.properties.typezone))
                this.style = { ...this.style, ...this.getStyle('style_zone_urbaines__au') }
            else if (['Ah', 'Nd', 'A', 'N', 'Nh'].includes(this.feature.properties.typezone))
                this.style = { ...this.style, ...this.getStyle('style_zone_urbaines__n') }
        }
        else if (['style_ocsge_couverture', 'style_ocsge_usage'].includes(this.styleKey)) {
            let leaf

            if (this.styleKey === 'style_ocsge_couverture')
                leaf = this.couv_leafs.find(el => el.code_couverture == this.feature.properties.code_couverture.replaceAll('.', '_'))

            if (this.styleKey === 'style_ocsge_usage')
                leaf = this.usa_leafs.find(el => el.code_usage == this.feature.properties.code_usage.replaceAll('.', '_'))
            
            this.style = { ...this.style, ...{ fillColor: leaf?.map_color, color: leaf?.map_color } }
        }
        else if (this.styleKey === 'style_ocsge_diff') {
            if (this.feature.properties.is_new_artif)
                this.style = { ...this.style, ...this.getStyle('style_ocsge_diff__new_artif') }
            
            if (this.feature.properties.is_new_natural)
                this.style = { ...this.style, ...this.getStyle('style_ocsge_diff__new_natural') }
        }

        return this.style
    }

    setHighlight() {
        this.highlight = this.getStyle('style_highlight')
    }

    getStyle(_key) {
        return layerStyles.find(el => el.key === _key)
    }

    updateKey(_key) {
        this.styleKey = _key
        this.setStyle()
    }
}