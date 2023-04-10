const placekit = require('@placekit/client-js');
const { createPopper } = require('@popperjs/core');

require('./placekit.css');

/** @external Position built-in Geolocation position type */

/**
 * @typedef {Object} Result PlaceKit result
 * @prop {string} name
 * @prop {string} city
 * @prop {string} county
 * @prop {string} administrative
 * @prop {string} country
 * @prop {string} countrycode
 * @prop {number} lat
 * @prop {number} lng
 * @prop {string} type
 * @prop {string[]} zipcode
 * @prop {number} population
 * @prop {string} highlight
 */

/**
 * @callback Template
 * @param {Result} item PlaceKit result item
 * @param {number} index PlaceKit result index (position) in results list
 * @return {string}
 */

/**
 * @callback FormatValue
 * @param {Result} item PlaceKit result item
 * @return {string}
 */

/**
 * @typedef {Object} PKOptions PlaceKit parameters
 * @prop {number} [timeout] Timeout in ms
 * @prop {number} [maxResults] Max results to return
 * @prop {string[]} [types] Results type
 * @prop {string} [language] Results language (ISO 639-1)
 * @prop {boolean} [countryByIP] Get country from IP
 * @prop {boolean} [forwardIP] Set `x-forwarded-for` header to override IP when `countryByIP` is `true`.
 * @prop {string[]} [countries] Countries to search in, or fallback to if `countryByIP` is true (ISO 639-1)
 * @prop {string} [coordinates] Coordinates search starts around
 */

/**
 * @typedef {Object} Options PlaceKit parameters
 * @augments PKOptions
 * @prop {HTMLInputElement} target Target input DOM element
 * @prop {number} [offset] Suggestions panel vertical offset (in px)
 * @prop {Template} [template] Suggestion item template
 * @prop {FormatValue} [formatValue] Return value formatting function
 * @prop {string} [noResult] No result template
 * @prop {'absolute'|'fixed'} [strategy] Popper positionning strategy (see https://popper.js.org/docs/v2/constructors/#strategy)
 * @prop {boolean} [flip] Flip when overflowing (defaults to false)
 * @prop {string} [className] Additional panel class name
 */

/**
 * PlaceKit initialization closure
 * @desc Fetch wrapper over the PlaceKit API to implement a retry strategy and parameters checking.
 * @module placekitAutocomplete
 * @arg {string} apiKey PlaceKit API key
 * @arg {Options} [options] PlaceKit global parameters
 * @return {client}
 */
module.exports = (apiKey, options = {}) => {
  // Init client
  // ----------------------------------------
  const client = {};
  const handlers = {};

  // Check options
  // ----------------------------------------
  // extract options after overriding defaults
  const {
    target,
    offset,
    template,
    formatValue,
    noResult,
    strategy,
    flip,
    className,
    ...pkOptions
  } = {
    target: '#placekit',
    offset: 4,
    template: (item) => {
      const icon = item.type === 'country' ?
        `<img class="pka-suggestions-item-flag" src="https://flagcdn.com/${item.countrycode}.svg" alt="${item.countrycode}" />` :
        `<span class="pka-suggestions-item-icon"><span class="pka-sr-only">${item.type}</span></span>`;
      const sub = item.type === 'country' ? '' : [
        (item.type === 'city' ? item.zipcode.sort()[0] : item.city),
        item.county
      ].filter((a) => a).join(item.type === 'city' ? ' ' : ', ');
      return `
        ${icon}
        <span class="pka-suggestions-item-label">
          <span class="pka-suggestions-item-label-name">${item.highlight}</span>
          <span class="pka-suggestions-item-label-sub">${sub}</span>
        </span>
      `;
    },
    formatValue: (item) => item.name,
    noResult: `
      <span class="pka-suggestions-item-icon"><span class="pka-sr-only">no result</span></span>
      <span class="pka-suggestions-item-label">
        <span class="pka-suggestions-item-label-name">No result.</span>
      </span>
    `,
    strategy: 'absolute',
    flip: false,
    ...options,
  };

  // throw error if invalid options
  if (!template?.call) {
    throw (`TypeError: options.template must be a function returning a string.`);
  }

  if (!formatValue?.call) {
    throw (`TypeError: options.formatValue must be a function returning a string.`);
  }

  const input = typeof target === 'string' ? document.querySelector(target) : target;
  if (!input) {
    throw (`Error: target not found.`);
  } else if (input.tagName !== 'INPUT' || !['text', 'search'].includes(input.getAttribute('type'))) {
    throw (`Error: target must be an HTML input of type "text" or "search".`);
  }

  // add accessibility attributes
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', false);
  input.setAttribute('role', 'combobox');


  // Build suggestions panel
  // ----------------------------------------
  // suggestions panel
  const suggestionsPanel = document.createElement('div');
  suggestionsPanel.classList.add('pka-suggestions');
  if (typeof className === 'string') {
    suggestionsPanel.classList.add(...className.split(/\s+/));
  }

  // suggestions list
  const suggestionsList = document.createElement('div');
  suggestionsList.classList.add('pka-suggestions-list');
  suggestionsList.setAttribute('role', 'listbox');
  suggestionsPanel.appendChild(suggestionsList);

  // suggestions panel footer
  const suggestionsFooter = document.createElement('div');
  suggestionsFooter.classList.add('pka-suggestions-credits');
  suggestionsFooter.innerHTML = `
    <span class="pka-suggestions-credits-text">Powered by</span>
    <a href="https://placekit.io/?utm_source=${encodeURI(window.location.hostname)}" target="_blank" class="pka-suggestions-credits-link">
      <svg viewBox="0 0 98 24" fill-rule="evenodd" fill="currentColor" height="14">
        <path d="M10.618 20.336a.506.506 0 0 1 .558-.414 8.009 8.009 0 0 0 1.867 0 .506.506 0 0 1 .557.414l.177 1a.504.504 0 0 1-.435.59 10.227 10.227 0 0 1-2.465 0 .51.51 0 0 1-.434-.59l.175-1Zm-6.577-5.521a.506.506 0 0 1 .639.28 8.12 8.12 0 0 0 2.971 3.542.504.504 0 0 1 .164.675c-.152.268-.35.612-.507.884a.508.508 0 0 1-.71.174 10.181 10.181 0 0 1-3.807-4.539.502.502 0 0 1 .293-.665c.294-.109.667-.245.957-.351Zm15.5.281a.504.504 0 0 1 .637-.278c.29.103.664.239.958.346a.503.503 0 0 1 .295.668 10.19 10.19 0 0 1-3.811 4.536.5.5 0 0 1-.707-.174c-.158-.27-.357-.614-.511-.88a.508.508 0 0 1 .165-.679 8.107 8.107 0 0 0 2.974-3.539Zm-11.003-.391-.008-.007a5.064 5.064 0 0 1 0-7.158 5.064 5.064 0 0 1 7.158 0 5.064 5.064 0 0 1 .001 7.157l.006.007-2.863 2.864a1.013 1.013 0 0 1-1.432 0l-2.862-2.863Zm3.575-5.601a2.015 2.015 0 0 1 0 4.028 2.015 2.015 0 0 1 0-4.028Zm9.023-.511a.507.507 0 0 1 .656.324c.236.775.382 1.591.426 2.433a.504.504 0 0 1-.505.527c-.312.002-.709.002-1.016.002a.507.507 0 0 1-.505-.481 7.986 7.986 0 0 0-.321-1.833.505.505 0 0 1 .31-.623l.955-.349Zm-18.707.324a.505.505 0 0 1 .654-.323c.295.106.667.242.956.347.253.092.39.367.311.624a7.988 7.988 0 0 0-.323 1.833.505.505 0 0 1-.504.479c-.308.002-.704.002-1.017.002a.508.508 0 0 1-.505-.529c.044-.842.191-1.658.428-2.433Zm11.349-6.499a.504.504 0 0 1 .607-.406 10.143 10.143 0 0 1 5.128 2.967.507.507 0 0 1-.049.726c-.238.203-.542.458-.778.656a.506.506 0 0 1-.697-.045 8.071 8.071 0 0 0-4.001-2.315.504.504 0 0 1-.385-.579c.051-.304.12-.695.175-1.004Zm-3.942-.404a.502.502 0 0 1 .604.405c.056.308.125.699.179 1.003a.506.506 0 0 1-.387.581 8.07 8.07 0 0 0-4.003 2.312.504.504 0 0 1-.694.044c-.237-.196-.541-.451-.781-.653a.506.506 0 0 1-.049-.728 10.136 10.136 0 0 1 5.131-2.964Z" />
        <path d="M30.315 20.5v-5.028c.597.868 1.483 1.321 2.55 1.321 2.496 0 4.087-1.845 4.087-5.137 0-3.165-1.555-5.1-4.087-5.1-1.067 0-1.935.489-2.55 1.375V6.828H28V20.5h2.315Zm61.146-6.999c0 2.17.94 3.292 2.911 3.292.633 0 1.158-.109 1.411-.236v-1.7h-.434c-1.284 0-1.573-.542-1.573-1.555V8.618h2.043v-1.79h-2.043V4.603h-2.315v2.225h-1.248v1.79h1.248v4.883Zm-28.412-3.237c-.326-2.478-2.062-3.708-4.268-3.708-2.785 0-4.576 1.845-4.576 5.137 0 3.146 1.736 5.1 4.594 5.1 2.188 0 3.888-1.14 4.322-3.563h-2.333c-.235 1.103-.94 1.646-1.935 1.646-1.465 0-2.26-1.14-2.26-3.183 0-2.08.759-3.22 2.188-3.22.976 0 1.736.525 1.953 1.791h2.315Zm-17.018-.253c.145-.923.741-1.538 1.845-1.538 1.284 0 1.88.67 1.88 1.917v.236c-1.627.018-2.875.126-4.159.56-1.483.488-2.225 1.483-2.225 2.803 0 1.863 1.357 2.804 3.256 2.804 1.157 0 2.351-.471 3.146-1.592.019.525.073.995.199 1.32h2.406c-.181-.506-.29-1.175-.29-2.369V10.39c0-2.242-1.374-3.834-4.069-3.834-2.441 0-4.015 1.303-4.322 3.455h2.333Zm27.905 3.345h-2.441c-.308 1.031-1.049 1.538-2.134 1.538-1.411 0-2.225-.977-2.333-2.749h6.836v-.543c0-3.129-1.754-5.046-4.594-5.046-2.821 0-4.63 1.845-4.63 5.137 0 3.164 1.791 5.1 4.721 5.1 2.315 0 4.051-1.194 4.575-3.437Zm12.425 3.165h2.315V6.828h-2.315v9.693Zm-47.365 0h2.315V3.5h-2.315v13.021Zm36.966 0h2.315v-4.684l3.653 4.684h2.839l-4.178-5.389 3.907-4.304h-2.713l-3.508 4.051V3.5h-2.315v13.021Zm-30.257-2.658c0-.977.76-1.754 4.051-1.809v.416c0 1.447-1.103 2.604-2.532 2.604-.94 0-1.519-.47-1.519-1.211Zm-13.256-5.39c1.356 0 2.116 1.14 2.116 3.183 0 2.08-.742 3.22-2.116 3.22-1.356 0-2.134-1.158-2.134-3.22 0-2.061.741-3.183 2.134-3.183Zm36.821-.018c1.212 0 1.953.796 2.17 2.243h-4.358c.217-1.465.958-2.243 2.188-2.243Zm17.091-2.712h2.315V3.5h-2.315v2.243Z" />
      </svg>
    </a>
  `;
  suggestionsPanel.appendChild(suggestionsFooter);
  document.body.appendChild(suggestionsPanel);

  // Instantiate third-party libs
  // ----------------------------------------
  // PlaceKit JS client
  const pk = placekit(apiKey, pkOptions);

  // Popper.js for panel positionning
  const popperInstance = createPopper(input, suggestionsPanel, {
    placement: 'bottom-start',
    strategy,
    modifiers: [
      {
        name: 'flip',
        enabled: flip,
      },
      {
        name: 'offset',
        options: {
          offset: [0, offset],
        },
      }
    ],
  });

  // States
  // ----------------------------------------
  let isEmpty = true;
  let isFreeForm = true;
  let suggestions = [];

  // Utility functions
  // ----------------------------------------
  // fire registered event handler
  const fireEvent = (event, ...args) => {
    if (handlers[event]?.call) {
      handlers[event].apply(client, args);
    }
  };

  // open/close the suggestions panel
  const togglePanel = (open = true) => {
    const prevIsOpen = suggestionsPanel.classList.contains('pka-open');
    suggestionsPanel.classList.toggle('pka-open', open);
    input.setAttribute('aria-expanded', open);
    if (prevIsOpen !== open) {
      fireEvent(open ? 'open' : 'close');
    }
  };

  // clear active (hover/keyboard-selected) suggestions
  const clearActive = () => {
    suggestions.forEach(({ element }) => element.classList.remove('pka-active'));
  };

  // update suggestions list with API response
  const updateSuggestions = (query, items) => {
    suggestionsList.innerHTML = '';
    suggestions = [];
    for (let i = 0, l = items.length; i<l; i++) {
      const item = items[i];
      const element = document.createElement('div');
      element.classList.add('pka-suggestions-item');
      element.classList.add(`pka-type-${item.type}`);
      element.setAttribute('role', 'option');
      element.setAttribute('tabindex', -1);
      element.setAttribute('aria-selected', false);
      element.innerHTML = template(item, i);
      element.addEventListener('mouseover', () => {
        clearActive();
        element.classList.add('pka-active');
      });
      suggestionsList.appendChild(element);
      // push both DOM element and result JSON
      suggestions.push({
        element,
        item,
      });
    }
    if (suggestions.length) {
      suggestions[0].element.classList.add('pka-active');
    } else {
      const element = document.createElement('div');
      element.classList.add('pka-suggestions-item');
      element.classList.add(`pka-type-no-result`);
      element.setAttribute('role', 'option');
      element.setAttribute('tabindex', -1);
      element.setAttribute('aria-selected', false);
      element.setAttribute('aria-disabled', true);
      element.innerHTML = noResult;
      suggestionsList.appendChild(element);
    }
    popperInstance.update();
    togglePanel(!!query || pk.hasGeolocation);
    fireEvent('results', query, items);
  };

  // move cursor (keyboard nav)
  const moveSelection = (n) => {
    const prev = Math.max(0, suggestions.findIndex(({ element }) => element.classList.contains('pka-active')));
    clearActive();
    const current = Math.max(0, Math.min(suggestions.length - 1, prev + n));
    suggestions[current].element.classList.add('pka-active');
    if (prev + n < 0) {
      togglePanel(false);
    }
  };

  // inject selected suggestion into input
  const applySelection = (index) => {
    if (typeof index === 'undefined') {
      index = Math.max(0, suggestions.findIndex(({ element }) => element.classList.contains('pka-active')));
    }
    const current = suggestions[index];
    if (current) {
      suggestions.forEach(({ element }) => {
        element.classList.remove('pka-selected');
        element.setAttribute('aria-selected', false);
      });
      current.element.classList.add('pka-selected');
      current.element.setAttribute('aria-selected', true);
      input.value = formatValue(current.item).trim();
      input.dispatchEvent(new Event('change'));
      input.focus();
      togglePanel(false);
      isEmpty = false;
      isFreeForm = false;
      fireEvent('empty', false);
      fireEvent('freeForm', false);
      fireEvent('pick', input.value, current.item, index);
    }
  };

  // Event handlers
  // ----------------------------------------
  // update suggestions as user types
  const onInput = () => {
    pk.search(input.value)
      .then(({ results }) => updateSuggestions(input.value.trim(), results))
      .catch((err) => fireEvent('error', err));
    isEmpty = !input.value;
    isFreeForm = true;
    fireEvent('empty', isEmpty);
    fireEvent('freeForm', true);
  };

  // open panel on input focus
  const onFocus = () => {
    togglePanel(!!input.value.trim());
  };

  // close panel on click outside
  const onClickOutside = (e) => {
    if (![input, suggestionsPanel].includes(e.target) && !suggestionsPanel.contains(e.target)) {
      togglePanel(false);
    }
  };

  // keyboard navigation
  const onKeyNav = (e) => {
    if (input === document.activeElement && !!input.value.trim()) {
      const isPanelOpen = suggestionsPanel.classList.contains('pka-open');
      switch (e.key) {
        case 'Up':
        case 'ArrowUp':
          if (isPanelOpen) {
            e.preventDefault();
            moveSelection(-1);
          }
          break;
        case 'Down':
        case 'ArrowDown':
          if (isPanelOpen) {
            e.preventDefault();
            moveSelection(1);
          } else {
            togglePanel(true);
          }
          break;
        case 'Enter':
          if (isPanelOpen) {
            e.preventDefault();
            applySelection();
          }
          break;
        case 'Esc':
        case 'Escape':
          if (isPanelOpen) {
            e.preventDefault();
            togglePanel(false);
          }
          break;
        case 'Tab':
          togglePanel(false);
          break;
      }
    }
  };

  // click on a suggestion to inject its value into the input
  const onPick = (e) => {
    const index = suggestions.findIndex(({ element }) => element.contains(e.target));
    if (index > -1) {
      applySelection(index);
    }
  };

  // update suggestions panel size on window resize
  const onResize = () => {
    window.requestAnimationFrame(() => {
      suggestionsPanel.style.width = `${input.offsetWidth}px`;
      popperInstance.update();
    });
  };

  // Bind events
  // ----------------------------------------
  onResize();
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(input);

  input.addEventListener('input', onInput);
  input.addEventListener('click', onFocus);
  input.addEventListener('focus', onFocus);
  suggestionsList.addEventListener('click', onPick);
  window.addEventListener('keydown', onKeyNav);
  window.addEventListener('click', onClickOutside);

  // Return instance
  // ----------------------------------------
  /**
   * Make `client.input` read-only
   * @member {HTMLInputElement}
   * @memberof client
   * @readonly
   */
  Object.defineProperty(client, 'input', {
    get: () => input,
  });

  /**
   * Make `client.options` read-only
   * @member {Options}
   * @memberof client
   * @readonly
   */
  Object.defineProperty(client, 'options', {
    get: () => ({
      ...options,
      ...pk.options,
    }),
  });

  /**
   * Make `client.handlers` read-only
   * @member {Object.<string, function>}
   * @memberof client
   * @readonly
   */
  Object.defineProperty(client, 'handlers', {
    get: () => handlers,
  });

  /**
   * Make `client.isEmpty` read-only
   * @member {boolean}
   * @memberof client
   * @readonly
   */
  Object.defineProperty(client, 'isEmpty', {
    get: () => isEmpty,
  });

  /**
   * Make `client.isFreeForm` read-only
   * @desc Enable devs to handle strict address validation
   * @member {boolean}
   * @memberof client
   * @readonly
   */
  Object.defineProperty(client, 'isFreeForm', {
    get: () => isFreeForm,
  });

  /**
   * Forward `pk.hasGeolocation`
   * @member {boolean}
   * @memberof client
   * @readonly
   */
  Object.defineProperty(client, 'hasGeolocation', {
    get: () => pk.hasGeolocation,
  });

  /**
   * Open suggestions panel
   * @memberof client
   * @return {client}
   */
  client.clear = () => {
    input.value = '';
    input.dispatchEvent(new Event('change'));
    input.dispatchEvent(new Event('input'));
    togglePanel(false);
    input.focus();
    return client;
  };

  /**
   * Register event handler
   * @memberof client
   * @arg {string} event Event name
   * @arg {function} [handler] Handler function (leave empty to unbind)
   * @return {client}
   */
  client.on = (event, handler) => {
    if (typeof event !== 'string') {
      throw (`Error: first argument 'event' must be a string.`);
    }
    if (typeof handler !== 'undefined' && !handler.call) {
      throw (`Error: second argument 'handler' must be a function if defined.`);
    }
    if (handler) {
      handlers[event] = handler;
    } else if (event in handlers) {
      delete handlers[event];
    }
    return client;
  };

  /**
   * Open suggestions panel
   * @memberof client
   * @return {client}
   */
  client.open = () => {
    togglePanel(true);
    return client;
  };

  /**
   * Close suggestions panel
   * @memberof client
   * @return {client}
   */
  client.close = () => {
    togglePanel(false);
    return client;
  };

  /**
   * Unbind events
   * @memberof client
   */
  client.destroy = () => {
    input.removeEventListener('input', onInput);
    input.removeEventListener('click', onFocus);
    input.removeEventListener('focus', onFocus);
    window.removeEventListener('keydown', onKeyNav);
    window.removeEventListener('click', onClickOutside);
    window.removeEventListener('resize', onResize);
    resizeObserver.unobserve(input);
    suggestionsPanel.remove();
  };

  /**
   * Set global parameters
   * @memberof client
   * @arg {PKOptions} [opts] PlaceKit JS Client global parameters
   * @return {client}
   */
  client.configure = (opts = {}) => {
    pk.configure(opts);
    return client;
  };

  /**
   * Request the device's location
   * @memberof client
   * @arg {Object} [opts] `navigator.geolocation.getCurrentPosition` options
   * @arg {boolean} [cancelUpdate] Cancel suggestions list auto-update
   * @return {Promise<Position>}
   */
  client.requestGeolocation = (opts = {}, cancelUpdate = false) =>
    pk.requestGeolocation(opts).then((pos) => {
      fireEvent('geolocation', true, pos);
      if (!cancelUpdate) {
        pk.search(input.value)
          .then(({ results }) => {
            updateSuggestions(input.value.trim(), results);
          })
          .catch((err) => {
            fireEvent('error', err);
          });
      }
      return pos;
    }).catch((err) => {
      fireEvent('geolocation', false);
      throw err;
    });

  return client;
};
