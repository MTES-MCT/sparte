var info = L.control()
var legend = L.control({ position: 'bottomright' });

///// HELPER FUNCTIONS

// cast "True" or "False" to true or false
function cast(value) {
    return (value == "True") ? true :
        (value == "False") ? false :
        value
}

// equivalent of dict().get(field, default_value) from python
function get(object, key, default_value) {
    let result = object[key]
    if (typeof result !== "undefined")
        return cast(result)
    else
        return default_value
}

function get_info_label(name) {
    return (name == "area") ? "Surface (Ha)" :
        (name == "artif_area") ? "Consommé (pdt diag.)" :
        (name == "artif_evo") ? "Artificialisation" :
        (name == "city") ? "Commune" :
        (name == "conso_1121_act") ? "Conso activité 11-21" :
        (name == "conso_1121_art") ? "Conso total 11-21" :
        (name == "conso_1121_hab") ? "Conso habitat 11-21" :
        (name == "cs_new") ? "Nouvelle couverture" :
        (name == "cs_old") ? "Ancienne couverture" :
        (name == "couverture_2015") ? "Couverture en 2015" :
        (name == "couverture_2018") ? "Couverture en 2018" :
        (name == "couverture_label") ? "Couverture" :
        (name == "id") ? "" :
        (name == "insee") ? "Code INSEE" :
        (name == "is_new_artif") ? "Artificialisation" :
        (name == "is_new_natural") ? "Renaturation" :
        (name == "map_color") ? "" :
        (name == "name") ? "Nom" :
        (name == "surface") ? "Surface (Ha)" :
        (name == "surface_artif") ? "Artificialisée" :
        (name == "us_new") ? "Nouveau usage" :
        (name == "us_old") ? "Ancien usage" :
        (name == "usage_2015") ? "Usage en 2015" :
        (name == "usage_2018") ? "Usage en 2018" :
        (name == "usage_label") ? "Usage" :
        (name == "year") ? "Millésime" :
        (name == "year_new") ? "Nouveau millésime" :
        (name == "year_old") ? "Ancien millésime" :
        name
}

/////////////////////////////////////////////////
// Styling function according to properties
/////////////////////////////////////////////////

function emprise_style(feature) {
    return {
        // background options
        fill: false,
        // border (or stoke) options
        weight: 2,
        opacity: 1,
        color: 'yellow',
        fillOpacity: 0
    }
}

function style_zone_artificielle(feature) {
    return {
        fillColor: '#f88e55',
        fillOpacity: 0.5,
        weight: 0.5,
        opacity: 1,
        color: '#f88e55',
    }
}

function style_communes(feature) {
    return {
        fillColor: '#ffffff',
        fillOpacity: 0.1,
        weight: 1,
        opacity: 0.7,
        color: '#FF8C00',
    }
}

function get_color_for_ocsge_diff(feature) {
    if (feature.properties["is_new_artif"] == true) {
        return {
            fillColor: '#ff0000',
            fillOpacity: 0.7,
            weight: 0,
            opacity: 1,
            color: '#ff0000',
        }
    }
    if (feature.properties["is_new_natural"] == true) {
        return {
            fillColor: '#00ff00',
            fillOpacity: 0.7,
            weight: 0,
            opacity: 1,
            color: '#00ff00',
        }
    }
    return {
        fillColor: '#ffffff',
        fillOpacity: 0.7,
        weight: 0,
        opacity: 1,
        color: '#ffffff',
    }
}

// Styling :
// 1. valeur identique pour toutes les features (zone artificielle, emprise)
// 2. basée sur une échélle et la valeur d'une propriété (exemple surface pour
//    renaturation ou densité pour les communes)
// 3. la couleur est dans la base de données (OCSGE)

/////////////////////////
// INITIALISATION
/////////////////////////

function Carto(map_center, default_zoom) {
    this.map_center = map_center
    this.default_zoom = default_zoom

    //this.layerControl = L.control.layers(null, null)
    this.info = L.control({ position: 'bottomleft' })
    this.legend = L.control({ position: 'bottomright' });
    this.map = L.map('mapid', {
        center: this.map_center,
        zoom: this.default_zoom
    })

    // contains all added geolayer (see add_geolayer function)
    this.geolayers = []

    // contains all panes. Usefull to ordering the geolayer
    // Each panes has a specific z-index
    this.panes = []

    this.init = (geolayers) => {
        // Initialize map
        // this.map.flyTo(this.map_center, this.default_zoom)

        for (i = 0; i < 10; i++) {
            let pane_name = `level_${i}`
            let pane = this.map.createPane(pane_name)
            pane.style.zIndex = 505 + 10 * i
            this.panes.push(pane_name)
        }

        // Choix du fond de carte
        let ortho = L.tileLayer(
                'https://wxs.ign.fr/{ignApiKey}/geoportail/wmts?' +
                '&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&TILEMATRIXSET=PM' +
                '&LAYER={ignLayer}&STYLE={style}&FORMAT={format}' +
                '&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}', {
                    attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
                    ignApiKey: 'ortho',
                    ignLayer: 'ORTHOIMAGERY.ORTHOPHOTOS',
                    style: 'normal',
                    format: 'image/jpeg',
                    service: 'WMTS'
                }
            ).addTo(this.map)
            // add info div
        this.info.addTo(this.map);

        // add legend div
        // this.legend.addTo(this.map)

        geolayers.forEach(layer => this.add_geolayer(layer))
    }

    this.add_geolayer = (geolayer) => {
        let layer = new GeoLayer(geolayer.name, geolayer.url)

        // set the property containing the information to choose the color
        // could be the color itself
        layer.color_property_name = get(geolayer, "color_property_name", "surface")

        // set an eventlistner to load only visible data if we don't load
        // everything upfront (which is better)
        layer.load_full_data = get(geolayer, "load_full_data", false)

        // displayer the layer immediatly after data loading or wait the user
        // to make it visible
        layer.display = get(geolayer, "display", false)

        // center the map on this layer
        // todo : check that there is only one layer with this activated
        layer.fit_map = get(geolayer, "fit_map", false)

        // change style function if style is set
        let style = get(geolayer, "style", undefined)
        if (style == 'style_zone_artificielle')
            layer.style = style_zone_artificielle
        if (style == 'style_emprise')
            layer.style = emprise_style
        if (style == 'style_communes')
            layer.style = style_communes
        if (style == 'get_color_from_property')
            layer.get_color = layer.get_color_from_property
        if (style == 'get_color_for_ocsge_diff')
            layer.style = get_color_for_ocsge_diff

        // set the correct panes according to required level
        // level can be set from 0 to 9
        // 9 is on top, 0 is the most lowest
        let pane = `level_${get(geolayer, "level", "5")}`
        if (this.panes.includes(pane)) // check the layer is known
            layer.pane = pane

        // set the url to retrieve the scale
        layer.scale_url = get(geolayer, "gradient_url", undefined)
        // change how the get_color works to use the scale
        if (layer.scale_url != undefined) {
            layer.get_color = layer.get_color_from_scale
        }

        // if switch is OCSGE, replace building form function
        is_ocsge_switch = get(geolayer, "switch", undefined)
        if (is_ocsge_switch == "ocsge")
            layer.create_switch = layer.create_switch_for_ocsge

        layer.add_to_map(this)
    }

    this.info.onAdd = (map) => {
        // create a div with a class "info"
        this._info_div = L.DomUtil.create('div', 'info');
        return this._info_div;
    }

    // method that we will use to update the control
    this.info.update = (html_content) => {
        this._info_div.innerHTML = html_content
    }

    // this.legend.onAdd = (map) => {
    //     // create a div with a class "legend"
    //     this._info_legend = L.DomUtil.create('div', 'info legend');
    //     return this._info_legend;
    // }

    // this.legend.update = (html_content) => {
    //     this._info_legend.innerHTML = html_content
    // }
}


/////////////////////////////////
//  Add layer
/////////////////////////////////

function GeoLayer(name, url) {
    // name of the layer, to be displayed in layercontrol div
    this.name = name
    // url where to fetch GeoJson data
    this.url = url
    // will contain the built GeoJsonLayer
    this.geojsonlayer = null
    // will contain fetched data
    this.data = null

    this.info_txt = null

    // define if the layer is to be displayed as soon data are retrieved
    this.display = true

    // reférence à l'objet carto qui contient map
    this.carto = null

    // indicates if all the data have to be loaded at once or if we reload data on each user map movement
    // when loading the data we will use bbox information to get data only on visible part of the map
    this.load_full_data = true

    // contains the name of the pane in which add this layer
    // by default, we add the layer in pane level_5
    this.pane = 'level_5'

    // Initialiser avec un objet permettant une colorisation personnalisée
    // value doit être la borne haute
    // this.scale = [
    //     {value: 100, color: '#ff0000'},  //   0 -> 100
    //     {value: 150, color: '#ff3300'},  // 101 -> 150
    //     {value: 230, color: '#ff6600'},  // 151 -> 230
    // ]
    this.scale = null
    // Define the url to get data for initialise the scale
    this.scale_url = undefined

    // Set to true to center the map on layer after data has been loaded
    this.fit_map = false

    // Define which property to use to set color of a feature
    this.color_property_name = "surface"

    // DOM element containing the loading image for the filter widget
    this.loading_img = undefined

    // a surcharger pour changer la façon dont la couleur est choisie
    // par exemple : this.get_color = this.get_color_from_property
    this.get_color = (feature) => {
        let letters = '0123456789ABCDEF'
        let color = '#'
        for (let i = 0; i < 6; i++)
            color += letters[Math.floor(Math.random() * 16)]
        return color
    }

    // utilise this.scale pour afficher la couleur
    // match against a scale to find the value
    this.get_color_from_scale = (feature) => {
        // get the property that will decide the color
        property_value = feature.properties[this.color_property_name]
        // use provided scale and color
        // return gray in case of unset
        let item = this.scale.find((item) => property_value <= item.value)
        // si on a pas trouvé, on doit être sur la dernière valeur de scale
        // donc le find n'est jamais vrai, on va donc récupérer la dernière
        // valeur pour initialiser item
        item = item ? item : this.scale[this.scale.length - 1]
        // finalement, on renvoit la couleur
        return item.color
    }

    // return a color defined in the property of each feature
    this.get_color_from_property = (feature) => {
        return feature.properties[this.color_property_name]
    }

    // A surcharger pour changer le styling par défault d'une feature
    this.style = (feature) => {
        return {
            fillColor: this.get_color(feature),
            fillOpacity: 0.5,
            weight: 1,
            opacity: 0.1,
            color: 'white',
        }
    }

    // A surcharger pour changer le style de mise en avant
    this.highlight_style = {
        weight: 3,
        color: '#777',
        dashArray: '',
        fillOpacity: 0.7
    }

    // surcharge to update content of info div (return empty string to not show info)
    this.info_txt = (properties) => {
        let info = '<h4>' + this.name + '</h4>'
        let properties_names = Object.getOwnPropertyNames(properties)
        for (i = 0; i < properties_names.length; i++) {
            let property_name = properties_names[i]
            let label = get_info_label(property_name)
            if (label != "") {
                let property_value = properties[property_name]
                if (label == "Surface (Ha)" | label == "Consommé (pdt diag.)") {
                    property_value = property_value.toFixed(1)
                    info = info + `<b>${label}</b>: ${property_value}<br/>`
                } else if (property_name == "artif_evo") {
                    info = info + `<b>${label}</b>:<br/>`
                    info = info + `<table class="table table-striped table-sm"><thead><tr><th>Période</th><th>Artif</th><th>Renat</th></tr></thead><tbody>`
                    for (j = 0; j < property_value.length; j++) {
                        new_artif = property_value[j].new_artif
                        new_natural = property_value[j].new_natural
                        info = info + `<tr><td>${property_value[j].year_old}-${property_value[j].year_new}</td>`
                        info = info + `<td>${new_artif}</td>`
                        info = info + `<td>${new_natural}</td></tr>`
                    }
                    info = info + `</tbody></table>`
                } else
                    info = info + `<b>${label}</b>: ${property_value}<br/>`
            }
        }
        return info
    }

    // surcharge to update content of legend div (return empty string to not show info)
    // this.legend_txt = (feature) => {
    //     if (this.scale == null)
    //         return null
    //     let property = this.color_property_name
    //     let property_value = feature.properties[property]
    //     let legend = '<h4>' + this.name + '</h4>'
    //     let bold = false
    //     let val = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(property_value)
    //     legend = legend + `Propriété utilisée: ${property} (${val})<br\>`

    //     for (i = 0; i < this.scale.length; i++) {
    //         let color = this.scale[i].color
    //         let value = this.scale[i].value
    //         let next_value = i + 1 < this.scale.length ? this.scale[i + 1].value : '+'
    //         if ((bold == false) && (i + 1 == this.scale.length || property_value < next_value)) {
    //             legend = legend + `<i style="background:${color}"></i> <b>${value} &ndash; ${next_value}</b></br>`
    //             bold = true
    //         } else {
    //             legend = legend + `<i style="background:${color}"></i> ${value} &ndash; ${next_value}</br>`
    //         }
    //     }
    //     return legend
    // }

    // set the layer appearance, fetch the data and display it on the map
    this.add_to_map = (carto) => {

        this.carto = carto
        this.create_switch()

        // define appearance
        this.geojsonlayer = L.geoJson(
            null, {
                style: this.style,
                onEachFeature: (feature, layer) => {
                    layer.on({
                        // Highlight on mouse hover
                        mouseover: (e) => {
                            e.target.setStyle(this.highlight_style)

                            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                                layer.bringToFront();
                            }

                            // mets à jour le div d'information
                            carto.info.update(this.info_txt(feature.properties))
                                // carto.legend.update(this.legend_txt(feature))
                        },
                        // on mousse out
                        mouseout: (e) => {
                            e.target.setStyle(this.style(feature))
                            carto.info.update('')
                        }

                    })
                },
                pane: this.pane,
            }
        )

        this.geojsonlayer.addTo(carto.map)

        // if a scale_url is defined, we retrieve the scale data before
        // retrieving the layer data
        if (this.scale_url != undefined)
            $.getJSON(this.scale_url, (data) => {
                this.scale = data
                this._add_to_map_step_2()
            }) // TODO faire un point d'arrêt pour récupérer les données
        else
            this._add_to_map_step_2()
    }

    this._add_to_map_step_2 = () => {
        this.refresh_data()

        // Add this layer into the layercontrol div (checkbox to display it)
        // carto.layerControl.addOverlay(this.geojsonlayer, this.name)

        if (this.load_full_data == false)
        // add an eventlistner on user moving the map
            carto.map.on('moveend', this.refresh_data)
    }

    this.get_url = () => {
        return this.url
    }

    this.refresh_data = () => {

        // if the layer is not displayed, we do not refresh it
        if (this.display == false)
            return

        //display loading image
        // this.loading_img.setAttribute("style", "display: inline;")
        this.loading_img.classList.remove("d-none")
        this.loading_img.classList.add("d-inline")

        // full: indicate if we have to load everything (true) or if we have to get only data visible on the map (false)

        let url = this.get_url()
        if (this.load_full_data == false) {
            if (url.includes("?"))
                url = url + '&'
            else
                url = url + '?'
            url = url + `in_bbox=${this.carto.map.getBounds().toBBoxString()}`
        }

        // get the data and display the layer
        $.getJSON(url, (data) => {
            /* best solution to add new data to a geojson layer would be to filter new data to remove data already
            loaded before (those in this.data). I choose to clear completly the data to avoid getting caught on
            difficult js stuff but this is definitely need to be improved. Current tactic create a flicker UI very
            displeasant. */
            this.data = data
            this.geojsonlayer.clearLayers()
            this.geojsonlayer.addData(data)

            if (this.fit_map) {
                // TODO : move this in carto object
                // center the layer on the center of the map
                this.fit_map = false // do not recenter after first loading
                bounds = this.geojsonlayer.getBounds()
                carto.map.fitBounds(bounds);
            }

            // hide loading image
            // this.loading_img.setAttribute("style", "display: none;")
            this.loading_img.classList.remove("d-inline")
            this.loading_img.classList.add("d-none")

        })
    }

    this.create_switch = () => {
        // create wrapper div
        let outer_div = document.createElement("div")
        outer_div.setAttribute("class", "form-check form-switch")
        document.getElementById("layer_list").appendChild(outer_div)
            // add switch
        let input = document.createElement("input")
        input.setAttribute("class", "form-check-input")
        input.setAttribute("type", "checkbox")
            // input.setAttribute("index", index)
        input.checked = this.display // == "True" ? true : false
        let id = `${this.name}_switch`
        input.setAttribute("id", id)
        outer_div.appendChild(input);
        // add label
        let label = document.createElement("label")
        label.setAttribute("class", "form-check-label")
        label.setAttribute("for", id)
        label.innerHTML = this.name
        outer_div.appendChild(label)

        this.create_loading_image(label)

        input.addEventListener('click', (event, state) => {
            let checked = event.target.checked
            if (checked) {
                this.activate_layer()
            } else {
                this.deactivate_layer()
            }
        })
    }

    this.create_loading_image = (container) => {
        let img = document.createElement("img")
        img.setAttribute("src", "/static/carto/img/loading-buffering.gif")
        img.setAttribute("class", "ms-1 d-none")
        // img.setAttribute("style", "display: none;")
        img.setAttribute("width", "12")
        img.setAttribute("height", "12")
        this.loading_img = img
        container.appendChild(this.loading_img)
    }

    this.activate_layer = () => {
        this.display = true
        this.refresh_data()
        _paq.push(['trackEvent', 'Consultation diagnostic', 'Affichage', this.name])
    }

    this.deactivate_layer = () => {
        this.display = false
        this.geojsonlayer.clearLayers()
    }

    this.create_switch_for_ocsge = () => {
        // create wrapper div
        let outer_div = document.createElement("div")
        outer_div.setAttribute("class", "form-check form-switch")
        document.getElementById("layer_list").appendChild(outer_div)
            //document.getElementById("layer_ocsge").appendChild(outer_div)
            // add input button
        let input = document.createElement("input")
        input.setAttribute("class", "form-check-input")
        input.setAttribute("type", "checkbox")
            // input.setAttribute("index", index)
        input.checked = this.display // == "True" ? true : false
        let id = `${this.name}_switch`
        input.setAttribute("id", id)
        outer_div.appendChild(input);
        // add label
        let label = document.createElement("label")
        label.setAttribute("class", "form-check-label")
        label.setAttribute("for", id)
            //label.innerHTML = this.name
        outer_div.appendChild(label)

        // <div class="input-group">
        let input_div = document.createElement("div")
        input_div.setAttribute("class", "input-group")
        label.appendChild(input_div)

        // <div class="input-group-text">@</div>
        let text_div = document.createElement("div")
        text_div.setAttribute("class", "input-group-text")
        text_div.innerHTML = "OCSGE : "
        input_div.appendChild(text_div)

        let select_year = get_select("ocsge_years", { "2015": "2015", "2018": "2018" })
        select_year.addEventListener('click', (e, s) => this.click(input))
        input_div.appendChild(select_year)

        let select_sol = get_select("ocsge_sol", {
            "usage": "Usage du sol",
            "couverture": "Couverture du sol"
        })
        select_sol.addEventListener('click', (e, s) => this.click(input))
        input_div.appendChild(select_sol)

        this.create_loading_image(label)

        this.get_url = () => {
            let url = this.url
            if (url.includes("?"))
                url = url + '&'
            else
                url = url + '?'
                //?year=2015&color=couverture
            url = url + `year=${document.getElementById("ocsge_years").value}`
            url = url + `&color=${document.getElementById("ocsge_sol").value}`
            return url
        }

        input.addEventListener('click', (e, s) => this.click(e.target))
    }

    this.click = (target) => {
        if (target.checked) {
            this.activate_layer()
        } else {
            this.deactivate_layer()
        }
    }

}

function get_select(id, options) {
    let select = document.createElement("select")
    select.setAttribute("class", "form-select form-select-sm")
    select.setAttribute("aria-label", "form-select")
    select.setAttribute("id", id)
    for (const [key, value] of Object.entries(options)) {
        let option = document.createElement("option")
        option.setAttribute("value", key)
        option.innerHTML = value
        select.appendChild(option)
    }
    return select
}

function get_loading_gif(id) {
    let img = document.createElement("img")
    img.setAttribute("src", "/static/carto/img/loading-buffering.gif")
    img.setAttribute("id", id)
    img.setAttribute("width", "12")
    img.setAttribute("height", "12")
}
