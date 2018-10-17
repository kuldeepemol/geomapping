// Store our API endpoint inside queryUrl
var earthQuakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var faultlineUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the Earthquake URL
d3.json(earthQuakeUrl, function(earthQuakeData) {
  
    // Once we get a response,
    // use d3 json to get the faultline geojson
    d3.json(faultlineUrl, function(faultLineData) {

        // Pass EarthQuake and FaultLine geoJSON to createFeatures function
        createFeatures(earthQuakeData.features, faultLineData.features);
    
    });
});

// Return color based on earthquake magnitude
function getColorByMagnitude(magnitude) {
    var color = '#B8F15A';
    if (magnitude > 5) {
        color = '#EE6C6E';
    } else if (magnitude > 4) {
        color = '#EEA770';
    } else if (magnitude > 3) {
        color = '#F2B957';
    } else if (magnitude > 2) {
        color = '#F2DA5A';
    } else if (magnitude > 1) {
        color = '#E1F15B';
    }

    return color;
}

function createFeatures(earthQuakeData, faultLineData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>Time: " + new Date(feature.properties.time) + "</p>"+
        "<p>Magnitude: " + feature.properties.mag + "</p>");
    }

    // Circle marker using magnitude as radius and color range by magnitude
    function pointToLayer(feature, latlng) {
        var color = getColorByMagnitude(feature.properties.mag);
        return L.circleMarker(latlng, {
            radius: feature.properties.mag * 3,
            fillColor: color,
            color: color,
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        });
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthQuakeData, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });

    // Fault line using style
    var faultlines = L.geoJSON(faultLineData, {
        style: {
            "color": "#EC9926",
            "weight": 2,
            "opacity": 0.65
        }
    });

    // Sending our earthquakes and faultline layer to the createMap function
    createMap(earthquakes, faultlines);
}

function createMap(earthquakes, faultlines) {

    // Define satellite layer
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 20,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    // Define grayscale layer
    var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 20,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    // Define outdoor layer
    var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 20,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satellitemap,
        "Grayscale": grayscalemap,
        "Outdoor": outdoormap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Fault Lines": faultlines
    };

    // Create our map, giving it the satellite map, earthquakes and faultline layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 3,
        layers: [satellitemap, earthquakes, faultlines]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Set up the legend
    var legend = L.control({
        position: "bottomright"
    });

    // Configure legend HTML
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var legendInfo = "<h3>Magnitude scale</h3>";

        div.innerHTML = legendInfo;

        div.innerHTML +=   
            '<div class="box" style="background-color: ' + getColorByMagnitude(1) + '"></div><span class="explanation"> 0-1 </span><br/>' +
            '<div class="box" style="background-color: ' + getColorByMagnitude(2) + '"></div><span class="explanation"> 1-2 </span><br/>' +
            '<div class="box" style="background-color: ' + getColorByMagnitude(3) + '"></div><span class="explanation"> 2-3 </span><br/>' +
            '<div class="box" style="background-color: ' + getColorByMagnitude(4) + '"></div><span class="explanation"> 3-4 </span><br/>' +
            '<div class="box" style="background-color: ' + getColorByMagnitude(5) + '"></div><span class="explanation"> 4-5 </span><br/>' +
            '<div class="box" style="background-color: ' + getColorByMagnitude(6) + '"></div><span class="explanation"> 5+ </span><br/>';
        
        return div;
    };

    // Add legend to the map
    legend.addTo(myMap);

}