export default class Source {
    constructor(_options = {}) {
        this.mapLibre = window.mapLibre
        this.map = this.mapLibre.map

        this.key = _options.key
        this.onUpdate = _options.onUpdate
        this.params = _options.params
        this.params.cluster = this.params.cluster === 'true' ? true : false

        this.setSource()
    }

    // Setters
    setSource() {
        this.map.addSource(this.key, this.params)
    }

    // Actions
    async update() {
        if (this.key === "zonages-d-urbanisme-source") {

            const bbox = this.map.getBounds().toArray().join(',')
            let url = this.params.data
            url += `?in_bbox=${bbox}&type_zone=AUc,Aus,U,A,N&zoom=10`
            console.log(url);
            const source = this.map.getSource(this.key)
            source.setData(url)
        }
    }

    // async getData() {
    //     // Get url
    //     const url = this.params.data

    //     if (!url)
    //         return null

    //     try {
    //         const response = await fetch(url)
    //         const data = await response.json()

    //         return data
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }
}