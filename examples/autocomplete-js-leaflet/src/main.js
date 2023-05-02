import placekitAutocomplete from '@placekit/autocomplete-js';
import L from 'leaflet';

import './global.css';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

// instantiate Leaflet map
const map = L.map('map', {
  zoomControl: false,
}).setView([48.870820, 2.304442], 12);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);
L.control.zoom({
  position: 'topright',
}).addTo(map);

// set unique marker
let marker;
const updateMarker = (lat, lng) => {
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng]).addTo(map);
  }
  map.setView(marker.getLatLng(), 17);
};

// instantiate PlaceKit Autocomplete JS
const pka = placekitAutocomplete(import.meta.env.VITE_PLACEKIT_API_KEY, {
  target: '#placekit-input',
  countries: ['fr'],
});

// request geolocation on click
const geolocationButton = document.querySelector('#placekit-geolocation');
geolocationButton.addEventListener('click', () => {
  pka.requestGeolocation().then(() => {
    geolocationButton.classList.add('pka-enabled');
    geolocationButton.setAttribute('aria-checked', true);
  }).catch(() => {
    geolocationButton.classList.remove('pka-enabled');
    geolocationButton.setAttribute('aria-checked', false);
  });
});

// clear input on click
const clearButton = document.querySelector('#placekit-clear');
clearButton.addEventListener('click', pka.clear);

// hide clear button when input is empty
pka.on('empty', (isEmpty) => {
  clearButton.setAttribute('aria-hidden', isEmpty);
});

// add/update marker on pick/geolocation
pka.on('pick', (_, item) => {
  updateMarker(item.lat, item.lng);
});
pka.on('geolocation', (_, pos) => {
  updateMarker(pos.coords.latitude, pos.coords.longitude);
});