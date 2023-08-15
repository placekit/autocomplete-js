import placekitAutocomplete from '@placekit/autocomplete-js';

import './global.css';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

// instantiate PlaceKit Autocomplete JS
const pka = placekitAutocomplete(import.meta.env.VITE_PLACEKIT_API_KEY, {
  target: '#placekit-input',
});

// request geolocation on click
const geolocationButton = document.querySelector('#placekit-geolocation');
if (geolocationButton) {
  geolocationButton.addEventListener('click', () => {
    if (pka.state.geolocation) {
      pka.clearGeolocation();
    } else {
      pka.requestGeolocation();
    }
  });
  // add .pka-enabled when granted
  pka.on('geolocation', (bool) => {
    geolocationButton.setAttribute('aria-checked', bool.toString());
    geolocationButton.classList.toggle('pka-enabled', bool);
  });
}

// clear input on click
const clearButton = document.querySelector('#placekit-clear');
if (clearButton) {
  clearButton.addEventListener('click', pka.clear);
  // hide clear button when input is empty
  pka.on('empty', (empty) => {
    clearButton.setAttribute('aria-hidden', empty.toString());
  });
}