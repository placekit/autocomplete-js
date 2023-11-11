<h1 align="center">
  PlaceKit Autocomplete JS Library
</h1>

<p align="center">
  <b>All-in-one address autocomplete experience for your web apps</b>
</p>

<div align="center">

  [![NPM](https://img.shields.io/npm/v/@placekit/autocomplete-js?style=flat-square)](https://www.npmjs.com/package/@placekit/autocomplete-js?activeTab=readme)
  [![LICENSE](https://img.shields.io/github/license/placekit/autocomplete-js?style=flat-square)](./LICENSE)
  
</div>

<p align="center">
  <a href="#-quick-start">Quick start</a> • 
  <a href="#-features">Features</a> • 
  <a href="#-reference">Reference</a> • 
  <a href="#-customize">Customize</a> • 
  <a href="#%EF%B8%8F-additional-notes">Additional notes</a> • 
  <a href="#%EF%B8%8F-license">License</a>
</p>

---

PlaceKit Autocomplete JavaScript Library is a standalone address autocomplete field for your application, built on top of our [PlaceKit JS client](https://github.com/placekit/client-js). Under the hood it relies on [Popper](https://popper.js.org) to position the suggestions list, and on [Flagpedia](https://flagpedia.net) to display flags on country results.

If you already use a components library with an autocomplete field, or need a more advanced usage, please refer to our [PlaceKit JS client](https://github.com/placekit/client-js) reference and its [examples](https://github.com/placekit/client-js/tree/main/examples).

For React implementations, check our [PlaceKit Autocomplete React](https://github.com/placekit/autocomplete-react) library. And for Vue implementations, check our [Vue.js example](./examples/autocomplete-js-vue/).

## ✨ Features

- **Standalone** and **lightweight**: about 14kb of JS, and 5kb of CSS, gzipped
- **Cross browser**: compatible across all major modern browsers
- **Non-invasive**: use and style your own input element
- **Customizable** and **extensible** with events and hooks
- **TypeScript** compatible
- [**W3C WAI compliant**](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

## 🎯 Quick start

### CDN

First, import the library and the default stylesheet into the `<head>` tag in your HTML:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@placekit/autocomplete-js@2.1.4/dist/placekit-autocomplete.min.css" />
<script src="https://cdn.jsdelivr.net/npm/@placekit/autocomplete-js@2.1.4"></script>
```

After importing the library, `placekitAutocomplete` becomes available as a global:

```html
<input type="search" placeholder="Search place..." class="pka-input" id="placekit" />
<script>
  const pka = placekitAutocomplete('<your-api-key>', {
    target: '#placekit',
    // other options...
  });
</script>
```

Or if you are using native ES Modules:

```html
<script type="module">
  import placekitAutocomplete from 'https://cdn.jsdelivr.net/npm/@placekit/autocomplete-js@2.1.4/dist/placekit-autocomplete.esm.js';
  const pka = placekitAutocomplete(/* ... */);
  // ...
</script>
```

**NOTE:** Make sure to call `placekitAutocomplete` after the DOM is loaded so the input can be found.

### NPM

First, install PlaceKit Autocomplete using [npm](https://docs.npmjs.com/getting-started) package manager:

```sh
npm install --save @placekit/autocomplete-js
```

Then import the package and perform your first address search:

```js
// CommonJS syntax:
const placekitAutocomplete = require('@placekit/autocomplete-js');

// ES6 Modules syntax:
import placekit from '@placekit/autocomplete-js';

const pka = placekitAutocomplete('<your-api-key>', {
  target: '#placekit',
  // other options...
});
```

Don't forget to import `@placekit/autocomplete-js/dist/placekit-autocomplete.css` if you want to use our default style.
If you have trouble importing CSS from `node_modules`, copy/paste [its content](./src/placekit.css) into your own CSS.

👉 **Check out our [examples](./examples) for different use cases!**

## 🧰 Reference

- [`placekitAutocomplete()`](#placekitautocomplete)
- [`pka.input`](#pkainput)
- [`pka.options`](#pkaoptions)
- [`pka.configure()`](#pkaconfigure)
- [`pka.state`](#pkastate)
- [`pka.on()`](#pkaon)
- [`pka.handlers`](#pkahandlers)
- [`pka.requestGeolocation()`](#pkarequestgeolocation)
- [`pka.clearGeolocation()`](#pkacleargeolocation)
- [`pka.open()`](#pkaopen)
- [`pka.close()`](#pkaclose)
- [`pka.clear()`](#pkaclear)
- [`pka.setValue()`](#pkasetvalue)
- [`pka.destroy()`](#pkadestroy)

### `placekitAutocomplete()`

PlaceKit Autocomplete initialization function returns a PlaceKit Autocomplete client, named `pka` in all examples.

```js
const pka = placekitAutocomplete('<your-api-key>', {
  target: '#placekit',
  countries: ['fr'],
  maxResults: 10,
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `apiKey` | `string` | API key |
| `options` | `key-value mapping` (optional) | Global parameters (see [options](#pkaoptions)) |

⚠️ `target` must be set when instanciating `placekitAutocomplete`, all other options can be set later with [`pka.configure()`](#pkaconfigure).

### `pka.input`

Input field element passed as `target` option, read-only.

```js
console.log(pka.input); // <input ... />
```

### `pka.options`

Options from both PlaceKit Autocomplete and PlaceKit JS client, read-only.

```js
console.log(pka.options); // { "target": <input ... />, "language": "en", "maxResults": 10, ... }
```

| Option | From | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `target` | AutoComplete | `string\|Element` | `-` | Target input element or (unique) selector. |
| `panel` | AutoComplete | `object?` | `(...)` | Suggestions panel options, see [Panel options](#panel-options). |
| `format` | AutoComplete | `object?` | `(...)` | Formatting options, see [Format options](#format-options). |
| `countryAutoFill` | AutoComplete | `boolean?` | `true` | Automatically detect current country by IP and fill input when `types: ['country']`. |
| `countrySelect` | AutoComplete | `boolean?` | `true` | Show/hide country selector<sup>[(1)](#ft1)[(2)](#ft2)</sup>. |
| `maxResults` | JS client | `integer` | `5` | Number of results per page. |
| `language` | JS client | `string?` | `undefined` | Preferred language for the results<sup>[(3)](#ft3)</sup>, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. Supported languages are `en` and `fr`. By default the results are displayed in their country's language. |
| `types` | JS client | `string[]?` | `undefined` | Type of results to show. Array of accepted values: `street`, `city`, `country`, `airport`, `bus`, `train`, `townhall`, `tourism`. Prepend `-` to omit a type like `['-bus']`. Unset to return all. |
| `countries` | JS client | `string[]?` | `undefined` | Restrict search in specific countries. Array of [two-letter ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes<sup>[(3)](#ft3)</sup>. |
| `coordinates` | JS client | `string?` | `undefined` | Coordinates to search around. Automatically set when calling [`pka.requestGeolocation()`](#pkarequestgeolocation). |

- <a id="ft1"><b>[1]</b></a>: Ignored if `countries` option is set (Country selector is hidden).
- <a id="ft2"><b>[2]</b></a>: When `types: ['city']` is set, setting `countrySelect: false` enables a worldwide city search.
- <a id="ft3"><b>[3]</b></a>: See [Coverage](https://placekit.io/terms/coverage) for more details.

<details>
<summary><h4 id="panel-options">Panel options</h4></summary>

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `undefined` | Additional panel CSS class(es). |
| `offset` | `integer` | `4` | Gap between input and panel in pixels. |
| `strategy` | `'absolute' \| 'fixed'` | `absolute` | [Popper positioning strategy](https://popper.js.org/docs/v2/constructors/#strategy) |
| `flip` | `boolean` | `false` | Flip position top when overflowing. |

</details>
<details>
<summary><h4 id="format-options">Format options</h4></summary>

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `flag` | `(countrycode: string) => string` | [see placekit-autocomplete.js](./src/placekit-autocomplete.js#L56) | DOM for flags. |
| `icon` | `(name: string, label: string) => string` | [see placekit-autocomplete.js](./src/placekit-autocomplete.js#L57) | DOM for icons. |
| `sub` | `(item: object) => string` | [see placekit-autocomplete.js](./src/placekit-autocomplete.js#L58-L60) | Format suggestion secondary text |
| `noResults` | `(query: string) => string` | [see placekit-autocomplete.js](./src/placekit-autocomplete.js#L61) | Format "no results" text. |
| `value` | `(item: object) => string` | `item.name` | Format input value when user picks a suggestion. |
| `applySuggestion` | `string` | `"Apply suggestion"` | ARIA label for "insert" icon. |
| `cancel` | `string` | `"Cancel"` | Label for cancelling country selection mode. |

</details>

### `pka.configure()`

Updates all parameters (**except `target`**). Returns the instance so you can chain methods.

```js
pka.configure({
  panel: {
    className: 'my-suggestions',
    flip: true,
  },
  format: {
    value: (item) => `${item.name} ${item.city}`,
  },
  language: 'fr',
  maxResults: 5,
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `opts` | `key-value mapping` (optional) | Global parameters (see [options](#pkaoptions)) |

### `pka.state`

Read-only object of input state.

```js
console.log(pka.state); // {dirty: false, empty: false, freeForm: true, geolocation: false}

// `true` after the user modifies the input value.
console.log(pka.state.dirty); // true or false

// `true` whenever the input value is not empty.
console.log(pka.state.empty); // true or false

// `true` if the input has a free form value or `false` if value is selected from the suggestions.
console.log(pka.state.freeForm); // true or false

// `true` if device geolocation has been granted.
console.log(pka.state.geolocation); // true or false

// `true` if panel is in country selection mode.
console.log(pka.state.countryMode); // true or false
```

The `freeForm` value comes handy if you need to implement a strict validation of the address, but we don't interfere with how to implement it as input validation is always very specific to the project's stack.

### `pka.on()`

Register event handlers, methods can be chained.

```js
pka.on('open', () => {})
  .on('close', () => {})
  .on('results', (query, results) => {})
  .on('pick', (value, item, index) => {})
  .on('error', (error) => {})
  .on('dirty', (bool) => {})
  .on('empty', (bool) => {})
  .on('freeForm', (bool) => {})
  .on('geolocation', (bool, position, error) => {});
  .on('countryMode', (bool) => {});
  .on('state', (state) => {})
  .on('countryChange', (item) => {});
```

If you register a same event twice, the first one will be replaced.
So, to remove an handler, simply assign `undefined`:

```js
pka.on('open'); // clears handler for 'open' event
```

#### Events

##### `open`

Triggered when panel opens.

##### `close`

Triggered when panel closes.

##### `results`

Triggered when suggestions list gets updated, same as when the user types or enables geolocation.

| Parameter | Type | Description |
| --- | --- | --- |
| `query` | `string` | Input value. |
| `results` | `object[]` | Results returned from API. |

##### `pick`

Triggered when user selects an item from the suggestion list by clicking on it or pressing ENTER after using the keyboard navigation.

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Input value (value returned by `options.formatValue()`). |
| `item` | `object` | All item details returned from API. |
| `index` | `number` | Position of the selected item in the suggestions list, zero-based. |

##### `error`

Triggered on server error.

| Parameter | Type | Description |
| --- | --- | --- |
| `error` | `object` | Error details. |

##### `dirty`

Triggered when the input value changes.

| Parameter | Type | Description |
| --- | --- | --- |
| `dirty` | `boolean` | `true` after the user modifies the value. |

##### `empty`

Triggered when input value changes.

| Parameter | Type | Description |
| --- | --- | --- |
| `empty` | `boolean` | `true` if input is empty. |

##### `freeForm`

Triggered when input value changes.

| Parameter | Type | Description |
| --- | --- | --- |
| `freeForm` | `boolean` | `true` on user input, `false` on `pick` event. |

##### `geolocation`

Triggered when `state.geolocation` value changes (a.k.a. when `pka.requestGeolocation` is called).

| Parameter | Type | Description |
| --- | --- | --- |
| `geolocation` | `boolean` | `true` if granted, `false` if denied. |
| `position` | [`GeolocationPosition \| undefined`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition) | Passed when `geolocation` is `true`. |
| `error` | [`string \| undefined`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition) | Geolocation request error message. |

##### `countryMode`

Triggered when the user toggles the country selection mode. Always `false` if `countries` option is set, or if `countrySelect` is `false`.

| Parameter | Type | Description |
| --- | --- | --- |
| `bool` | `boolean` | `true` if open, `false` if closed. |

##### `state`

Triggered when one of the input states changes.

| Parameter | Type | Description |
| --- | --- | --- |
| `state` | `object` | The current input state. |

##### `countryChange`

Triggered when the current search country changes (either detected by IP, or selected by the user in the country selection mode).

| Parameter | Type | Description |
| --- | --- | --- |
| `item` | `object` | Country details returned from API. |

### `pka.handlers`

Reads registered event handlers, read-only.

```js
pka.on('open', () => {});
console.log(pka.handlers); // { open: ... }
```

### `pka.requestGeolocation()`

Requests device's geolocation (browser-only). Returns a Promise with a [`GeolocationPosition`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition) object.

```js
pka.requestGeolocation({ timeout: 10000 }).then((pos) => console.log(pos.coords));
```

| Parameter | Type | Description |
| --- | --- | --- |
| `opts` | `key-value mapping` (optional) | `navigator.geolocation.getCurrentPosition` [options](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition) |
| `cancelUpdate` | `boolean` (optional) | If `false` (default), suggestions list updates immediately based on device location. |

The location will be store in the `coordinates` global options, you can still manually override it.
`state.geolocation` will be set to `true`, dispatching both the `geolocation` and `state` events.

### `pka.clearGeolocation()`

Clear device's geolocation stored with [`pka.requestGeolocation`](#pkarequestGeolocation).

```js
pka.clearGeolocation();
```

The global option `coordinates` will be deleted and the `state.geolocation` will be set to `false`, dispatching both the `geolocation` and `state` events.

### `pka.open()`

Opens the suggestion panel.

```js
pka.open();
```

### `pka.close()`

Closes the suggestion panel.

```js
pka.close();
```

### `pka.clear()`

Clears the input value, focus the field, closes the suggestion panel and clear suggestions if `state.geolocation` is false or perform an empty search to reset geolocated suggestions otherwise.

```js
pka.clear();
```

### `pka.setValue()`

Manually set the input value. Useful for third-party wrappers like React.

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string | null` (optional) | New input value, operation ignored if `undefined` or `null`. |
| `notify` | `boolean` (optional) | Pass `true` to dispatch `change` and `input` events and update state (default `false`). |

```js
pka.setValue('new value');
pka.setValue('new value', true); // dispatch `change` and `input` event
```

**NOTE**: `state.empty` will automatically be updated based on the input value if `notify: true`. `state.dirty` and `state.freeForm` remain unchanged until the user focuses the input.

### `pka.destroy()`

Removes the suggestions panel from the DOM and clears all event handlers from `window` and `input` that were added by PlaceKit Autocomplete.

```js
pka.destroy();
```

## 💅 Customize

You have full control over the input element as PlaceKit Autocomplete doesn't style nor alter it by default.
We still provide a style that you can apply by adding the `.pka-input` class to your input element.

Colors, border-radius, font and overall scale (in `rem`) and even icons are accessible over variables:

```css
:root {
  --pka-scale: 1rem;
  --pka-color-accent: 1, 73, 200;
  --pka-color-black: 29, 41, 57;
  --pka-color-darker: 52, 64, 84;
  --pka-color-dark: 152, 162, 179;
  --pka-color-light: 207, 213, 221;
  --pka-color-lighter: 243, 244, 246;
  --pka-color-white: 255, 255, 255;
  --pka-border-radius: 6px;
  --pka-font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  --pka-z-index: 9999;

  --pka-icon-pin: url("...");
  --pka-icon-street: var(--pka-icon-pin);
  --pka-icon-city: url("...");
  --pka-icon-airport: url("...");
  --pka-icon-bus: url("...");
  --pka-icon-train: url("...");
  --pka-icon-townhall: url("...");
  --pka-icon-tourism: url("...");
  --pka-icon-noresults: url("...");
  --pka-icon-clear: url("...");
  --pka-icon-cancel: var(--pka-icon-clear);
  --pka-icon-insert: url("...");
  --pka-icon-check: url("...");
  --pka-icon-switch: url("...");
  --pka-icon-geo-off: url("...");
  --pka-icon-geo-on: url("...");
  --pka-icon-loading: url("...");
}

/* dark mode overrides */
body.dark,
body[data-theme="dark"] {
  --pka-color-accent: 55, 131, 249;
}
```

You also have full control over flags and icons DOM with `format.flag` and `format.icon` options (see [Format options](#format-options)).

For advanced customization, refer to our [stylesheet](./src/placekit.css) to learn about the available classes if you need to either override some or start a theme from scratch.

A dark mode is available whenever you add `.dark` class or `data-theme="dark"` attribute to the `<body>` element.

⚠️ **NOTE:** you are **not** allowed to hide the PlaceKit logo unless we've delivered a special authorization. To request one, please contact us using [our contact form](https://placekit.io/about#contact).

## ⚠️ Additional notes
- Setting a non-empty `value` attribute on the `<input>` will automatically trigger a first search request when the user focuses the input.

## ⚖️ License

PlaceKit Autocomplete JS Library is an open-sourced software licensed under the [MIT license](./LICENSE).
