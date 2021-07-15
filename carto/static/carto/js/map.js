// var map
// var GeoJsonLayer
var info = L.control()
// var LayerControl = L.control.layers(null, null)
var legend = L.control({position: 'bottomright'});

/////////////////////////////////////////////////
// Styling function according to properties
/////////////////////////////////////////////////

// set color according to a property
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
function style(feature) {
    return {
        fillColor: getColor(feature.properties.code),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    }
}

///////////////////////////////////
//  INTERACTION
///////////////////////////////////

function layer (name, url) {
    this.name = name;
    this.url = url;
}

// Highlight on mouse hover
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    // mets à jour le div d'information
    info.update(layer.feature.properties);
}
// on mousse out
function resetHighlight(e) {
    GeoJsonLayer.resetStyle(e.target);
    info.update();
}

// join on each feature
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    })
}

/////////////////////////
// ADD INFO DIV
/////////////////////////

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    if (props) {
        this._div.innerHTML = '<h4>Département</h4><b>' + props.nom + '</b><br />' + props.code
    }else{
        this._div.innerHTML = '<h4>Département</h4>Hover over a state'
    }
}

///////////////////////////////
// LEGEND
////////////////////////////////


legend.onAdd = function (map) {

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




/////////////////////////
// INITIALISATION
/////////////////////////

function Carto (center, zoom, name){

    this.center = center;
    this.zoom = zoom;
    this.name = name;

    this.map = L.map('mapid');
    this.info = L.control()
    this.layerControl = L.control.layers(null, null)
    this.legend = L.control({position: 'bottomright'});

    this.init = function () {
        this.map.setView(this.center, this.zoom)
        // Choix du fond de carte
        L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>- Beta Gouv.',
            subdomains: ['a','b','c']
        }).addTo( this.map )
        // add info div
        // this.info.addTo(this.map);
        // this.info.update()
        // Add layer control div
        this.layerControl.addTo(this.map)
        // add legend div
        // this.legend.addTo(this.map)
    }

    this.add_layer = function (layer, name, display) {
        this.layerControl.addOverlay(layer, name);
        if (display) {
            this.layer.layer.addTo( this.map )
        }
    }

    // this.info est une référence à un autre objet
    // à l'intérieur de onAdd this fait donc référence à info
    // on ajoute donc une référence vers le parent
    this.info.carto = this
    this.info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    this.info.update = function (props) {
        if (props) {
            this._div.innerHTML = '<h4>'+ this.carto.name + '</h4><b>' + props.nom + '</b><br />' + props.code
        }else{
            this._div.innerHTML = '<h4>'+ this.carto.name + '</h4>'
        }
    }
}

// var map = L.map('mapid')

// map.initialisation = function (map_center, default_zoom) {
//     // Initialize map
//     map.setView(map_center, default_zoom)
//     // Choix du fond de carte
//     L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>- Beta Gouv.',
//         subdomains: ['a','b','c']
//     }).addTo( map )
//     // add info div
//     info.addTo(map);
//     // Add layer control div
//     LayerControl.addTo(map)
//     // add legend div
//     legend.addTo(map)
// }


/////////////////////////////////
//  Add layer
/////////////////////////////////

function Layer (name, url) {
    this.name = name;
    this.url = url;
    this.data = null;
    this.layer = null;

    this.init = function (callback) {
        // GeoJsonLayer.addData(geojsonFeature);
        $.getJSON(this.url, function(data) {
            this.data = data
            this.layer = L.geoJson(
                data,
                {
                    style: style,
                    onEachFeature: onEachFeature
                }
            )
        })
        callback(this.layer, this.name, false);
    }

}

// map.add_layer = function (data_url, name)
// {
//     // GeoJsonLayer.addData(geojsonFeature);
//     $.getJSON(data_url, function(data) {
//         GeoJsonLayer = L.geoJson(
//             data,
//             {
//                 style: function (feature) {
//                     return {
//                         fillColor: getColor(feature.properties.code),
//                         weight: 2,
//                         opacity: 1,
//                         color: 'white',
//                         dashArray: '3',
//                         fillOpacity: 0.7
//                     }
//                 },
//                 onEachFeature: onEachFeature
//             }
//         )
//         //show new layer in control layer div
//         LayerControl.addOverlay(GeoJsonLayer, name)
//     })
// }
