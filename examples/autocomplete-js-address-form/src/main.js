import placekitAutocomplete from '@placekit/autocomplete-js';

import './global.css';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

// instantiate PlaceKit Autocomplete JS
const pka = placekitAutocomplete(import.meta.env.VITE_PLACEKIT_API_KEY, {
  target: '#placekit-input',
});

// inject values when user picks an address
const form = document.querySelector('#form');
pka.on('pick', (value, item) => {
  for (const name of ['city', 'zipcode', 'country']) {
    form.querySelector(`input[name="${name}"]`).value = [].concat(item[name]).join(',');
  }
});