import placekitAutocomplete from '@placekit/autocomplete-js';

import './global.css';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

// instantiate PlaceKit Autocomplete JS
const pka = placekitAutocomplete(import.meta.env.VITE_PLACEKIT_API_KEY, {
  target: '#placekit-input',
  countries: ['fr'],
});

// request geolocation on click
const geolocationButton = document.querySelector('#placekit-geolocation');
geolocationButton.addEventListener('click', () => {
  pka.requestGeolocation().then((pos) => {
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
pka.on('empty', (empty) => {
  clearButton.setAttribute('aria-hidden', empty);
});