var info = L.control()
var legend = L.control({position: 'bottomright'});

/////////////////////////////////////////////////
// Styling function according to properties
/////////////////////////////////////////////////

// used by legend
function getColor(d) {
    return d > 90 ? '#800026' :
           d > 70 ? '#BD0026' :
           d > 50 ? '#E31A1C' :
           d > 40 ? '#FC4E2A' :
           d > 30 ? '#FD8D3C' :
           d > 20 ? '#FEB24C' :
           d > 10 ? '#FED976' :
                    '#FFEDA0'
}


/////////////////////////
// INITIALISATION
/////////////////////////

function Carto (map_center, default_zoom)
{
    this.map_center = map_center
    this.default_zoom = default_zoom

    this.layerControl = L.control.layers(null, null)
    this.info = L.control()
    this.legend = L.control({position: 'bottomright'});
    this.map = L.map('mapid')

    this.init = () => {
        // Initialize map
        this.map.setView(this.map_center, this.default_zoom)
        // Choix du fond de carte
        L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>- Beta Gouv.',
            subdomains: ['a','b','c']
        }).addTo( this.map )
        // add info div
        this.info.addTo(this.map);
        // Add layer control div
        this.layerControl.addTo(this.map)
        // add legend div
        // this.legend.addTo(this.map)
    }

    this.info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        return this._div;
    }

    // method that we will use to update the control based on feature properties passed
    this.info.update = function (html_content) {
        this._div.innerHTML = html_content
    }

    this.legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 20, 30, 40, 50, 70, 90],
            labels = []

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
        }

        return div
    }
}





/////////////////////////////////
//  Add layer
/////////////////////////////////

function GeoLayer (name, url) {
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
    this.immediate_display = true

    // a surcharger pour changer la façon dont la couleur est choisie
    this.get_color = (feature) => {
        // get the property that will decide the color
        d = this.get_color_property(feature)
        // set the color according to the property's value
        return d > 90 ? '#800026' :
               d > 70 ? '#BD0026' :
               d > 50 ? '#E31A1C' :
               d > 40 ? '#FC4E2A' :
               d > 30 ? '#FD8D3C' :
               d > 20 ? '#FEB24C' :
               d > 10 ? '#FED976' :
                        '#FFEDA0'
    }

    // set which property must be used to set the color
    this.get_color_property = (feature) => {
        return feature.properties.code
    }

    // A surcharger pour changer le styling par défault d'une feature
    this.style = (feature) => {
        return {
            fillColor: this.get_color(feature),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
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
        return '<h4>' + this.name + '</h4><b>' + properties.nom + '</b><br/>' + properties.code
    }

    // set the layer appearance, fetch the data and display it on the map
    this.add_to_map = (carto) => {

        // define appearance
        this.geojsonlayer = L.geoJson(
            null,
            {
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
                        },
                        // on mousse out
                        mouseout: (e) => {
                            e.target.setStyle(this.style(feature))
                            carto.info.update('')
                        }

                    })
                }
            }
        )

        // get the data and display the layer
        $.getJSON(this.url, (data) => {
            this.data = data
            this.geojsonlayer.addData(this.data)
            //show new layer in control layer div
            carto.layerControl.addOverlay(this.geojsonlayer, this.name)

            if (this.immediate_display){
                this.geojsonlayer.addTo(carto.map)
            }
        })
    }

}
