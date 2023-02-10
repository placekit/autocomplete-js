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
  <a href="#%EF%B8%8F-license">License</a>
</p>

---

PlaceKit Autocomplete JavaScript Library is a standalone address autocomplete field for your application, built on top of our [PlaceKit JS client](https://github.com/placekit/client-js). Under the hood it relies on [Popper](https://popper.js.org) to position the suggestions list, and on [Flagpedia](https://flagpedia.net) to display flags on country results.

If you already use a components library with an autocomplete field, or need a more advanced usage, please refer to our [PlaceKit JS client](https://github.com/placekit/client-js) reference and its [examples](https://github.com/placekit/client-js/tree/main/examples).

For React implementations, check our [PlaceKit Autocomplete React](https://github.com/placekit/autocomplete-react) library.

## ✨ Features

- **Standalone** and **lightweight**: about 12kb of JS, and 4kb of CSS, gzipped
- **Cross browser**: compatible across all major modern browsers
- **Non-invasive**: use and style your own input element
- **Customizable** and **extensible** with events and hooks
- **TypeScript** compatible

## 🎯 Quick start

### CDN

First, import the library and the default stylesheet into the `<head>` tag in your HTML:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@placekit/autocomplete-js@1.0.0-alpha.9/dist/placekit-autocomplete.min.css" />
<script src="https://cdn.jsdelivr.net/npm/@placekit/autocomplete-js"></script>
```

After importing the library, `placekitAutocomplete` becomes available as a global:

```html
<input type="search" placeholder="Search place..." class="pka-input" id="placekit" />
<script>
  const pka = placekitAutocomplete('<your-api-key>', {
    target: '#placekit',
    countries: ['fr'],
    // other options...
  });
</script>
```

Or if you are using native ES Modules:

```html
<script type="module">
  import placekit from 'https://cdn.jsdelivr.net/npm/@placekit/autocomplete-js@1.0.0-alpha.9/dist/placekit-autocomplete.esm.js';
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
  countries: ['fr'],
  // other options...
});
```

Don't forget to import `@placekit/autocomplete-js/dist/placekit-autocomplete.css` if you want to use our default style.
If you have trouble importing CSS from `node_modules`, copy/paste [its content](./src/placekit.css) into your own CSS.

👉 **Check out our [examples](./examples) for different use cases!**

## 🧰 Reference

- [`placekitAutocomplete()`](#placekitAutocomplete)
- [`pka.input`](#pkainput)
- [`pka.options`](#pkaoptions)
- [`pka.configure()`](#pkaconfigure)
- [`pka.on()`](#pkaon)
- [`pka.handlers`](#pkahandlers)
- [`pka.isEmpty`](#pkaisEmpty)
- [`pka.isFreeForm`](#pkaisFreeForm)
- [`pka.requestGeolocation()`](#pkarequestGeolocation)
- [`pka.hasGeolocation`](#pkahasGeolocation)
- [`pka.open()`](#pkaopen)
- [`pka.close()`](#pkaclose)
- [`pka.clear()`](#pkaclear)
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
| `offset` | AutoComplete | `integer` | `4` | Gap between input and suggestions list in pixels. |
| `template` | AutoComplete | `(item: object) => string` | [see index.js](./src/index.js#L24-L39) | Suggestion item formatting function. |
| `formatValue` | AutoComplete | `(item: object) => string` | [see index.js](./src/index.js#L40) | Input value formatting function when selected from list. |
| `strategy` | AutoComplete | `'absolute' | 'fixed'` | `absolute` | [Popper positioning strategy](https://popper.js.org/docs/v2/constructors/#strategy) |
| `flip` | AutoComplete | `boolean` | `false` | Flip position top when overflowing. |
| `className` | AutoComplete | `string` | `undefined` | Additional suggestions panel CSS class(es). |
| `maxResults` | JS client | `integer` | `5` | Number of results per page. |
| `language` | JS client | `string?` | `undefined` | Language of the results, two-letter ISO language code. |
| `types` | JS client | `string[]?` | `undefined` | Type of results to show. Array of accepted values: `street`, `city`, `country`, `airport`, `bus`, `train`, `townhall`, `tourism`. Prepend `-` to omit a type like `['-bus']`. Unset to return all. |
| [`countries`](#%EF%B8%8F-countries-option-is-required) | `string[]?` | `undefined` | Countries to search in, or fallback to if `countryByIP` is `true`. Array of [two-letter ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes in the [supported list of countries](#supported-countries). |
| [`countryByIP`](#countryByIP-option) | `boolean?` | `undefined` | Use IP to find user's country (turned off). |
| `coordinates` | JS client | `string?` | `undefined` | Coordinates to search around. Automatically set when calling [`pka.requestGeolocation()`](#pkarequestGeolocation). |

#### ⚠️ `countries` option is required

The `countries` option is **required** at search time, but we like to keep it optional across all methods so developers remain free on when and how to define it: 
- either when instanciating with `placekit()`,
- with `pk.configure()`,
- or at search time with `pk.search()`.

If `countries` is missing or invalid, you'll get a `422` error.

#### Supported countries

Supported countries are `be`, `ca`, `ch`, `de`, `es`, `fr`, `gb`, `it`, `nl`, `pt`, `us`.

#### `countryByIP` option

Set `countryByIP` to `true` when you don't know which country users will search addresses in. In that case, the option `countries` will be used as a fallback if the user's country is not supported:

```js
pka.configure({
  countryByIP: true, // use user's country, based on their IP
  countries: ['fr', 'be'], // returning results from France and Belgium if user's country is not supported
});
```

### `pka.configure()`

Updates search parameters (only JS client options!). Returns the instance so you can chain methods.

```js
pka.configure({
  language: 'fr',
  maxResults: 5,
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `opts` | `key-value mapping` (optional) | Global parameters (see [options](#pkaoptions)) |

### `pka.on()`

Register event handlers, methods can be chained.

```js
pka.on('open', () => {})
  .on('close', () => {})
  .on('results', (query, results) => {})
  .on('pick', (value, item, index) => {})
  .on('error', (error) => {})
  .on('empty', (isEmpty) => {})
  .on('freeForm', (isFreeForm) => {})
  .on('geolocation', (hasGeolocation, position) => {});
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

##### `empty`

Triggered when input value changes.

| Parameter | Type | Description |
| --- | --- | --- |
| `isEmpty` | `boolean` | `true` if input is empty. |

##### `freeForm`

Triggered when input value changes.

| Parameter | Type | Description |
| --- | --- | --- |
| `isFreeForm` | `boolean` | `true` on user input, `false` on `pick` event. |

##### `geolocation`

Triggered when `hasGeolocation` value changes (a.k.a. when `pka.requestGeolocation` is called).

| Parameter | Type | Description |
| --- | --- | --- |
| `hasGeolocation` | `boolean` | `true` if granted, `false` if denied. |
| `position` | [`GeolocationPosition`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition) | Passed when `hasGeolocation` is `true`. |

### `pka.handlers`

Reads registered event handlers, read-only.

```js
pka.on('open', () => {});
console.log(pka.handlers); // { open: ... }
```

### `pka.isEmpty`

Read-only boolean, `true` if the input is empty.

```js
console.log(pka.isEmpty); // true or false
```

### `pka.isFreeForm`

Read-only boolean, `true` if the input has a free form value or `false` if value is selected from the suggestions.
The latter can only occur when the user has clicked on a suggestion or pressed ENTER after navigating the suggestions with the keyboard.

```js
console.log(pka.isFreeForm); // true or false
```

This value comes handy if you need to implement a strict validation of the address, but we don't interfere with how to implement it as input validation is always very specific to the project's stack.

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

### `pka.hasGeolocation`

Reads if device geolocation is activated or not (read-only).

```js
console.log(pka.hasGeolocation); // true or false
```

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

Clears the input value, focus the field, and closes the suggestion panel.

```js
pka.clear();
```

### `pka.destroy()`

Removes the suggestions panel from the DOM and clears all event handlers from `window` and `input` that were added by PlaceKit Autocomplete.

```js
pka.destroy();
```

## 💅 Customize

You have full control over the input element as PlaceKit Autocomplete doesn't style nor alter it by default.
We still provide a style that you can apply by adding the `.pka-input` class to your input element.

Colors, border-radius, font and overall scale (in `rem`) are accessible over variables:

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
}

/* dark mode overrides */
body.dark,
body[data-theme="dark"] {
  --pka-color-accent: 55, 131, 249;
}
```

For advanced customization, refer to our [stylesheet](./src/placekit.css) to learn about the available classes if you need to either override some or start a theme from scratch.

A dark mode is available whenever you add `.dark` class or `data-theme="dark"` attribute to the `<body>` element.

⚠️ **NOTE:** you are **not** allowed to hide the PlaceKit logo unless we've delivered a special authorization. To request one, please contact us using [our contact form](https://placekit.io/about#contact).

## ⚖️ License

PlaceKit Autocomplete JS Library is an open-sourced software licensed under the [MIT license](./LICENSE).
