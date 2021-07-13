// Initialize map
var map = L.map('mapid').setView([44.6586, -1.164], 10)
// Choose fond de carte
L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: ['a','b','c']
}).addTo( map )
// GEOJson layer

var GeoJsonLayer;

/////////////////////////////////////////////////
// Styling function according to properties
/////////////////////////////////////////////////

// set color according to a property
function getColor(d) {
    return d > 90 ? '#800026' :
           d > 70  ? '#BD0026' :
           d > 50  ? '#E31A1C' :
           d > 40  ? '#FC4E2A' :
           d > 30   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}
function style(feature) {
    return {
        fillColor: getColor(feature.properties.code),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

///////////////////////////////////
//  INTERACTION
///////////////////////////////////

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
        //click: zoomToFeature
    });
}

/////////////////////////
// ADD INFO DIV
/////////////////////////

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Département</h4>' +  (props ?
        '<b>' + props.nom + '</b><br />' + props.code
        : 'Hover over a state');
};

info.addTo(map);

///////////////////////////////
// LEGEND
////////////////////////////////

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 30, 40, 50, 70, 90],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

////////////////////////////
//  LAYER CONTROL
///////////////////////////

var LayerControl = L.control.layers(null, null).addTo(map);

/////////////////////////
// INITIALISATION
/////////////////////////

// GeoJsonLayer.addData(geojsonFeature);
$.getJSON("static/geojson/departements.geojson", function(data) {
    GeoJsonLayer = L.geoJson(
        data,
        {
            style: style,
            onEachFeature: onEachFeature
