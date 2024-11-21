// Initialize the map and set the view to a region (e.g., centered on the United States)
var map = L.map('map').setView([37.7749, -122.4194], 5); // Centered on the USA

// Add the OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Fetch the earthquake data from the provided URL
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(response => response.json())
  .then(data => processEarthquakeData(data))  // Process the data once fetched
  .catch(error => console.error('Error fetching earthquake data:', error));

// Function to process and display earthquake data
function processEarthquakeData(data) {
  // Loop through each earthquake feature
  data.features.forEach(earthquake => {
    var magnitude = earthquake.properties.mag;
    var place = earthquake.properties.place;
    var time = new Date(earthquake.properties.time);  // Convert time from Unix timestamp
    var latitude = earthquake.geometry.coordinates[1];  // Latitude
    var longitude = earthquake.geometry.coordinates[0];  // Longitude
    var depth = earthquake.geometry.coordinates[2];  // Depth in km

    // Set the size of the marker based on the earthquake's magnitude
    var markerSize = magnitude * 5; // Scale marker size by magnitude

    // Get the color based on the earthquake's depth
    var color = getColor(depth);

    // Create a circle marker for each earthquake
    L.circleMarker([latitude, longitude], {
      radius: markerSize,
      fillColor: color,
      color: color,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    })
    .bindPopup(`
      <h3>Magnitude: ${magnitude}</h3>
      <p>Location: ${place}</p>
      <p>Depth: ${depth} km</p>
      <p>Time: ${time}</p>
      <p><a href="${earthquake.properties.url}" target="_blank">More details</a></p>
    `)
    .addTo(map);
  });
}

// Function to determine the color of the marker based on depth
function getColor(depth) {
  return depth > 700 ? '#800026' :
         depth > 300 ? '#BD0026' :
         depth > 100 ? '#E31A1C' :
         depth > 50  ? '#FC4E2A' :
         depth > 20  ? '#FD8D3C' :
         depth > 0   ? '#FEB24C' :
                       '#FFEDA0';
}

// Add a legend to the map to explain the color scale
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function() {
  var div = L.DomUtil.create('div', 'info legend'),
      depths = [0, 20, 50, 100, 300, 700],
      labels = [];

  // Create legend color bands based on the depth ranges
  for (var i = 0; i < depths.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
      depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
  }

  return div;
};

legend.addTo(map);
