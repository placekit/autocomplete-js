import placekitAutocomplete from '@placekit/autocomplete-js';

import './global.css';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

// get default country value
const countrySelect = document.querySelector('#country');
const defaultValue = countrySelect.value;

// instantiate PlaceKit Autocomplete JS
const pka = placekitAutocomplete(import.meta.env.VITE_PLACEKIT_API_KEY, {
  target: '#placekit-input',
  countries: [defaultValue],
  countrySelect: false,
});

// disable input if no default country selected
if (!defaultValue) {
  pka.input.setAttribute('disabled', true);
}

// clear input on click
const clearButton = document.querySelector('#placekit-clear');
clearButton.addEventListener('click', pka.clear);

// hide clear button when input is empty
pka.on('empty', (empty) => {
  clearButton.setAttribute('aria-hidden', empty);
});

// custom country selector
countrySelect.addEventListener('change', (e) => {
  pka.configure({
    countries: [e.target.value],
  });
  if (e.target.value) {
    pka.input.removeAttribute('disabled');
    pka.input.focus();
  } else {
    pka.input.setAttribute('disabled', true);
  }
});