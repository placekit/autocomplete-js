import placekit from '@placekit/client-js/lite';
import { createPopper } from '@popperjs/core';

import './placekit-autocomplete.css'; // removed at build time

// generic helpers
const isString = (v) => Object.prototype.toString.call(v) === '[object String]';
const isObject = (v) => typeof v === 'object' && !Array.isArray(v) && v !== null;
const merge = (a, b) => {
  if (!isObject(a)) return b;
  Object.keys(b).forEach((k) => a[k] = isObject(b[k]) ? merge(a[k] || {}, b[k]) : b[k]);
  return a;
};

export default function placekitAutocomplete(
  apiKey,
  { target = '#placekit', ...initOptions } = {}
) {
  // Init client
  // ----------------------------------------
  // find input
  const input = isString(target) ? document.querySelector(target) : target;
  if (!input) {
    throw (`Error: target not found.`);
  } else if (input.tagName !== 'INPUT' || !['text', 'search'].includes(input.getAttribute('type'))) {
    throw (`Error: target must be an HTML input of type "text" or "search".`);
  }

  // internals
  const pk = placekit(apiKey);
  const handlers = new Map();
  let suggestions = [];
  let userValue = null; // preserve user value on keyboard nav
  let backupValue = null; // preserve user value on country mode
  let country = null;
  let globalSearchMode = false;

  // external
  const client = {};
  const state = {
    empty: !input.value,
    dirty: false,
    freeForm: true,
    geolocation: false,
    countryMode: false,
  };

  // default options
  const options = {
    panel: {
      className: '',
      offset: 4,
      strategy: 'absolute',
      flip: false,
    },
    format: {
      flag: (countrycode) => `<img class="pka-flag" src="https://flagcdn.com/64x48/${countrycode?.toLowerCase()}.png" alt="${countrycode}" loading="lazy" />`,
      icon: (name, label) => `<span class="pka-icon pka-icon-${name}" role="img" aria-label="${label || 'icon'}"></span>`,
      sub: (item) => item.type === 'country' ? '' : item.type === 'city' ?
        [item.zipcode.sort()[0], item.country].filter((s) => s).join(' ') :
        [item.city, item.county].filter((s) => s).join(', '),
      noResults: (query) => `No results for ${query}`,
      value: (item) => item.name,
      applySuggestion: 'Apply suggestion',
      cancel: 'Cancel',
    },
    countryAutoFill: true,
    countrySelect: true,
  };


  // Init DOM
  // ----------------------------------------
  // add input accessibility attributes
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', false);
  input.setAttribute('role', 'combobox');

  // build panel
  const panel = document.createElement('div');
  panel.classList.add('pka-panel');
  panel.innerHTML = `
    <div class="pka-panel-loading" role="progressbar" aria-hidden="true">${options.format.icon('loading')}</div>
    <div class="pka-panel-suggestions" role="listbox"></div>
    <div class="pka-panel-footer">
      <div class="pka-panel-country">
        <input type="checkbox" id="pka-panel-country-mode" class="pka-sr-only" aria-hidden="true" />
        <label for="pka-panel-country-mode" class="pka-panel-country-open">
        </label>
        <label for="pka-panel-country-mode" class="pka-panel-country-close">
          ${options.format.icon('cancel')}
          <span class="pka-panel-country-label">${options.format.cancel}</span>
        </label>
      </div>
      <div class="pka-panel-credits">
        <span class="pka-panel-credits-text">Powered by</span>
        <a href="https://placekit.io/?utm_source=${encodeURI(window.location.hostname)}" target="_blank" class="pka-panel-credits-link">
          <svg viewBox="0 0 98 24" fill-rule="evenodd" fill="currentColor" height="14">
            <path d="M10.618 20.336a.506.506 0 0 1 .558-.414 8.009 8.009 0 0 0 1.867 0 .506.506 0 0 1 .557.414l.177 1a.504.504 0 0 1-.435.59 10.227 10.227 0 0 1-2.465 0 .51.51 0 0 1-.434-.59l.175-1Zm-6.577-5.521a.506.506 0 0 1 .639.28 8.12 8.12 0 0 0 2.971 3.542.504.504 0 0 1 .164.675c-.152.268-.35.612-.507.884a.508.508 0 0 1-.71.174 10.181 10.181 0 0 1-3.807-4.539.502.502 0 0 1 .293-.665c.294-.109.667-.245.957-.351Zm15.5.281a.504.504 0 0 1 .637-.278c.29.103.664.239.958.346a.503.503 0 0 1 .295.668 10.19 10.19 0 0 1-3.811 4.536.5.5 0 0 1-.707-.174c-.158-.27-.357-.614-.511-.88a.508.508 0 0 1 .165-.679 8.107 8.107 0 0 0 2.974-3.539Zm-11.003-.391-.008-.007a5.064 5.064 0 0 1 0-7.158 5.064 5.064 0 0 1 7.158 0 5.064 5.064 0 0 1 .001 7.157l.006.007-2.863 2.864a1.013 1.013 0 0 1-1.432 0l-2.862-2.863Zm3.575-5.601a2.015 2.015 0 0 1 0 4.028 2.015 2.015 0 0 1 0-4.028Zm9.023-.511a.507.507 0 0 1 .656.324c.236.775.382 1.591.426 2.433a.504.504 0 0 1-.505.527c-.312.002-.709.002-1.016.002a.507.507 0 0 1-.505-.481 7.986 7.986 0 0 0-.321-1.833.505.505 0 0 1 .31-.623l.955-.349Zm-18.707.324a.505.505 0 0 1 .654-.323c.295.106.667.242.956.347.253.092.39.367.311.624a7.988 7.988 0 0 0-.323 1.833.505.505 0 0 1-.504.479c-.308.002-.704.002-1.017.002a.508.508 0 0 1-.505-.529c.044-.842.191-1.658.428-2.433Zm11.349-6.499a.504.504 0 0 1 .607-.406 10.143 10.143 0 0 1 5.128 2.967.507.507 0 0 1-.049.726c-.238.203-.542.458-.778.656a.506.506 0 0 1-.697-.045 8.071 8.071 0 0 0-4.001-2.315.504.504 0 0 1-.385-.579c.051-.304.12-.695.175-1.004Zm-3.942-.404a.502.502 0 0 1 .604.405c.056.308.125.699.179 1.003a.506.506 0 0 1-.387.581 8.07 8.07 0 0 0-4.003 2.312.504.504 0 0 1-.694.044c-.237-.196-.541-.451-.781-.653a.506.506 0 0 1-.049-.728 10.136 10.136 0 0 1 5.131-2.964Z" />
            <path d="M30.315 20.5v-5.028c.597.868 1.483 1.321 2.55 1.321 2.496 0 4.087-1.845 4.087-5.137 0-3.165-1.555-5.1-4.087-5.1-1.067 0-1.935.489-2.55 1.375V6.828H28V20.5h2.315Zm61.146-6.999c0 2.17.94 3.292 2.911 3.292.633 0 1.158-.109 1.411-.236v-1.7h-.434c-1.284 0-1.573-.542-1.573-1.555V8.618h2.043v-1.79h-2.043V4.603h-2.315v2.225h-1.248v1.79h1.248v4.883Zm-28.412-3.237c-.326-2.478-2.062-3.708-4.268-3.708-2.785 0-4.576 1.845-4.576 5.137 0 3.146 1.736 5.1 4.594 5.1 2.188 0 3.888-1.14 4.322-3.563h-2.333c-.235 1.103-.94 1.646-1.935 1.646-1.465 0-2.26-1.14-2.26-3.183 0-2.08.759-3.22 2.188-3.22.976 0 1.736.525 1.953 1.791h2.315Zm-17.018-.253c.145-.923.741-1.538 1.845-1.538 1.284 0 1.88.67 1.88 1.917v.236c-1.627.018-2.875.126-4.159.56-1.483.488-2.225 1.483-2.225 2.803 0 1.863 1.357 2.804 3.256 2.804 1.157 0 2.351-.471 3.146-1.592.019.525.073.995.199 1.32h2.406c-.181-.506-.29-1.175-.29-2.369V10.39c0-2.242-1.374-3.834-4.069-3.834-2.441 0-4.015 1.303-4.322 3.455h2.333Zm27.905 3.345h-2.441c-.308 1.031-1.049 1.538-2.134 1.538-1.411 0-2.225-.977-2.333-2.749h6.836v-.543c0-3.129-1.754-5.046-4.594-5.046-2.821 0-4.63 1.845-4.63 5.137 0 3.164 1.791 5.1 4.721 5.1 2.315 0 4.051-1.194 4.575-3.437Zm12.425 3.165h2.315V6.828h-2.315v9.693Zm-47.365 0h2.315V3.5h-2.315v13.021Zm36.966 0h2.315v-4.684l3.653 4.684h2.839l-4.178-5.389 3.907-4.304h-2.713l-3.508 4.051V3.5h-2.315v13.021Zm-30.257-2.658c0-.977.76-1.754 4.051-1.809v.416c0 1.447-1.103 2.604-2.532 2.604-.94 0-1.519-.47-1.519-1.211Zm-13.256-5.39c1.356 0 2.116 1.14 2.116 3.183 0 2.08-.742 3.22-2.116 3.22-1.356 0-2.134-1.158-2.134-3.22 0-2.061.741-3.183 2.134-3.183Zm36.821-.018c1.212 0 1.953.796 2.17 2.243h-4.358c.217-1.465.958-2.243 2.188-2.243Zm17.091-2.712h2.315V3.5h-2.315v2.243Z" />
          </svg>
        </a>
      </div>
    </div>
  `;
  document.body.append(panel);

  const loading = panel.querySelector('.pka-panel-loading');
  const suggestionsList = panel.querySelector('.pka-panel-suggestions');
  const countryMode = panel.querySelector('#pka-panel-country-mode');
  const popper = createPopper(input, panel);

  // Utility functions
  // ----------------------------------------
  // fire registered event handler
  function fireEvent(event, ...args) {
    if (handlers.has(event)) {
      handlers.get(event).apply(client, args);
    }
  }

  // set state value and fire event unless silent
  function setState(partial, silent = false) {
    if (!isObject(partial)) {
      throw (`TypeError: setState first argument must be a key/value object.`);
    }
    let update = false;
    for (const k in state) {
      if (k in partial && partial[k] !== state[k]) {
        state[k] = partial[k];
        update = true;
        if (!silent) {
          fireEvent(k, state[k]);
        }
      }
    }
    if (update) {
      fireEvent('state', state);
    }
  }

  // manually set input value
  function setValue(value, { notify = false, focus = true } = {}) {
    if (isString(value)) {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
      setState({ empty: !input.value });
      if (notify) {
        userValue = null;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (focus) {
        input.focus();
      }
    }
  }

  // manually clear input value
  function clearInput() {
    setValue('', {
      notify: true,
      focus: true,
    });
    togglePanel(false);
    if (state.geolocation) {
      search();
    } else {
      suggestions = [];
    }
  }

  // restore backed-up user value
  function restoreValue(clear = false) {
    if (userValue !== null) {
      setValue(userValue, { focus: false });
      if (clear) {
        userValue = null;
      }
    }
  }

  // open/close the suggestions panel
  function togglePanel(bool) {
    const prev = panel.classList.contains('pka-open');
    const open = typeof bool === 'undefined' ? !prev : bool;
    panel.classList.toggle('pka-open', open);
    input.setAttribute('aria-expanded', open);
    if (prev !== open) {
      if (!open) {
        clearActive();
      }
      fireEvent(open ? 'open' : 'close');
    }
  }

  // clear active (hover/keyboard-selected) suggestions
  function clearActive() {
    panel.querySelectorAll('[role="option"]').forEach((node) => node.classList.remove('pka-active'));
  }

  // move active suggestion cursor (keyboard nav) and preview value
  function moveActive(index) {
    if (userValue === null) {
      userValue = input.value;
    }
    const children = Array.from(suggestionsList.children);
    const prev = children.findIndex((node) => node.classList.contains('pka-active'));
    clearActive();
    const steps = children.length + 1; // cycle through user value + suggestions
    const pos = (prev + 1 + index + steps) % steps;
    if (pos === 0) {
      restoreValue();
    } else {
      const current = children[pos - 1];
      current.classList.add('pka-active');
      suggestionsList.scrollTo({ top: current.offsetTop });
      setValue(options.format.value(suggestions[pos - 1]));
    }
  }

  // inject active suggestion into input
  function applySuggestion(index) {
    const children = Array.from(suggestionsList.children);
    if (typeof index === 'undefined') {
      index = children.findIndex((node) => node.classList.contains('pka-active'));
    }
    const current = children[index];
    if (!current) return;
    const item = suggestions[index];
    if (state.countryMode) {
      setCountry(item);
      toggleCountryMode(false);
    } else {
      children.forEach((node, i) => {
        node.classList.toggle('pka-selected', i === index);
        node.setAttribute('aria-selected', i === index);
      });
      setValue(options.format.value(item), { notify: true });
      setState({
        dirty: true,
        freeForm: false,
      });
      togglePanel(false);
      fireEvent('pick', input.value, item, index);
    }
  }

  // debounce loading
  let loadingTimeout;
  function setLoading(bool) {
    clearTimeout(loadingTimeout);
    loading.setAttribute('aria-hidden', true);
    if (bool) {
      loadingTimeout = setTimeout(() => {
        loading.setAttribute('aria-hidden', false);
      }, 300);
    }
  }

  // search and update suggestions
  async function search() {
    userValue = null;
    const query = input.value;
    setState({
      empty: !query,
      dirty: true,
      freeForm: true,
    });
    setLoading(true);
    if (!countryMode.disabled) {
      await detectCountry();
    }
    // show flag for cities in global search
    const flagTypes = globalSearchMode ? ['city', 'country'] : ['country'];
    pk.search(query, {
      countries: !!country ? [country.countrycode] : options.countries,
      types: state.countryMode ? ['country'] : options.types,
      maxResults: state.countryMode ? 20 : options.maxResults,
    }).then(({ results }) => {
      setLoading(false);
      if (input.value !== query) return; // skip outdated
      suggestions = results;
      suggestionsList.innerHTML = results.length > 0 ? results.map((item) => `
        <div class="pka-panel-suggestion" role="option" tabindex="-1" aria-selected="false">
          ${flagTypes.includes(item.type) ? options.format.flag(item.countrycode) : options.format.icon(item.type || 'pin', item.type)}
          <span class="pka-panel-suggestion-label">
            <span class="pka-panel-suggestion-label-name">${item.highlight}</span>
            <span class="pka-panel-suggestion-label-sub">${options.format.sub(item)}</span>
          </span>
          <button type="button" class="pka-panel-suggestion-action" aria-label="${options.format.applySuggestion}" />
        </div>
      `).join('') : `
        <div class="pka-panel-suggestion" role="option" tabindex="-1" aria-selected="false" aria-disabled="true">
          ${options.format.icon('noresults')}
          <span class="pka-panel-suggestion-label">
            <span class="pka-panel-suggestion-label-name">
              ${options.format.noResults?.call ? options.format.noResults(query) : options.format.noResults}
            </span>
          </span>
        </div>
      `;
      popper.update();
      fireEvent('results', query, results);
    }).catch((err) => fireEvent('error', err));
  }

  // update current country
  function setCountry(item) {
    panel.querySelector('.pka-panel-country-open').innerHTML = item === null ? '' : `
      ${options.format.flag(item.countrycode)}
      <span class="pka-panel-country-label">${item.name}</span>
      ${options.format.icon('switch')}
    `;
    if (item?.countrycode !== country?.countrycode) {
      country = item;
      fireEvent('countryChange', country);
    }
  }

  // toggle country mode: search in countries
  function toggleCountryMode(bool) {
    countryMode.checked = !countryMode.disabled &&
      (typeof bool === 'undefined' ? !countryMode.checked : bool);
    setState({ countryMode: countryMode.checked });
    if (state.countryMode) {
      backupValue = input.value;
      setValue(country.name);
      input.select();
      search();
    } else if (backupValue !== null) {
      setValue(backupValue);
      backupValue = null;
      search();
    }
  }

  // detect current country with IP
  function detectCountry() {
    return !!country ? Promise.resolve(country) : pk.reverse({
      maxResults: 1,
      types: ['country'],
    }).then(({ results }) => {
      if (results.length) {
        setCountry(results[0]);
        return results[0];
      }
      return null;
    }).catch((err) => fireEvent('error', err));
  }


  // Event handlers
  // ----------------------------------------
  // JS-handled hover state
  panel.addEventListener('mousemove', (e) => {
    if (!e.movementX && !e.movementY) return;
    clearActive();
    e.target.closest('[role="option"]')?.classList.add('pka-active');
  });

  // preview/apply suggestion
  panel.addEventListener('click', (e) => {
    const target = e.target.closest('[role="option"]');
    if (!target) return;
    e.stopPropagation();
    const index = Array.from(suggestionsList.children).indexOf(target);
    if (e.target.closest('.pka-panel-suggestion-action')) {
      // inject suggestion with trailing space and keep typing
      const current = suggestions[index];
      if (current) {
        setValue(`${options.format.value(current)} `, { notify: true });
        setState({
          dirty: true,
          freeForm: false,
        });
      }
    } else {
      // apply suggestion
      applySuggestion(index);
    }
  });

  // toggle country mode
  countryMode.addEventListener('change', (e) => {
    toggleCountryMode(e.target.checked);
  });

  // update suggestions as user types
  function handleInput(e) {
    if (e instanceof InputEvent) {
      togglePanel(!!input.value.trim() || state.countryMode);
      search();
    }
  }
  input.addEventListener('input', handleInput);

  // open panel on input focus
  function handleFocus() {
    // trigger search if there's a default value
    if (!state.dirty && !!input.value) {
      togglePanel(true);
      search();
    } else {
      togglePanel(!!input.value.trim() || state.geolocation || state.countryMode);
    }
  }
  input.addEventListener('click', handleFocus);
  input.addEventListener('focus', handleFocus);

  // close panel on click outside
  function handleClickOutside(e) {
    if (![input, panel].includes(e.target) && !panel.contains(e.target)) {
      togglePanel(false);
      restoreValue(true);
    }
  }
  window.addEventListener('click', handleClickOutside);

  // keyboard navigation
  function handleKeyNav(e) {
    if (input === document.activeElement) {
      const isPanelOpen = panel.classList.contains('pka-open');
      switch (e.key) {
        case 'Up':
        case 'ArrowUp':
          // move through suggestions or open panel with ALT
          if (isPanelOpen) {
            e.preventDefault();
            if (e.altKey) {
              togglePanel(false);
            } else {
              moveActive(-1);
            }
          }
          break;
        case 'Down':
        case 'ArrowDown':
          // move through suggestions or open panel with ALT
          if (suggestions.length > 0) {
            if (!isPanelOpen) {
              e.preventDefault();
              togglePanel(true);
            } else if (!e.altKey) {
              e.preventDefault();
              moveActive(1);
            }
          }
          break;
        case 'Enter':
          // apply selected suggestion
          if (isPanelOpen) {
            e.preventDefault();
            applySuggestion();
          }
          break;
        case 'Esc':
        case 'Escape':
          // close countryMode, then panel, then clear value (default behaviour)
          e.preventDefault();
          if (isPanelOpen) {
            if (state.countryMode) {
              toggleCountryMode(false);
            } else {
              togglePanel(false);
              restoreValue(true);
            }
          } else {
            clearInput();
          }
          break;
        case 'Tab':
          togglePanel(false);
          break;
      }
    }
  }
  window.addEventListener('keydown', handleKeyNav);

  // update suggestions panel size on window resize
  function handleResize() {
    window.requestAnimationFrame(() => {
      panel.style.width = `${input.offsetWidth}px`;
      popper.update();
    });
  }

  handleResize();
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(input);


  // Configure
  // ----------------------------------------
  // Update parameters
  function configure(opts = {}) {
    // deep merge and destructure options
    delete opts.target;
    /* eslint-disable no-unused-vars */
    const {
      panel: panelOptions,
      format: formatOptions,
      countryAutoFill,
      countrySelect,
      ...pkOptions
    } = merge(options, opts);
    /* eslint-enable no-unused-vars */

    // update PlaceKit Client config
    pk.configure(pkOptions);

    // update panel class and placement
    panel.setAttribute('class', `pka-panel ${options.panel.className}`.trim());
    popper.setOptions({
      placement: 'bottom-start',
      strategy: options.panel.strategy,
      modifiers: [
        {
          name: 'flip',
          enabled: options.panel.flip,
        },
        {
          name: 'offset',
          options: {
            offset: [0, options.panel.offset],
          },
        }
      ],
    });

    // show country select
    const typesStr = options.types?.join(',').toLowerCase() ?? '';
    countryMode.disabled = options.countries || !options.countrySelect || typesStr === 'country';

    // set inner global search mode state
    globalSearchMode = !options.countries
      && !options.countrySelect
      && ['city', 'city,country', 'country,city', 'country'].includes(typesStr);

    // detect current country and inject into input as default value if type is ['country']
    if (options.countryAutoFill && typesStr === 'country' && !state.dirty && !input.value.trim()) {
      detectCountry().then((item) => {
        setValue(item.name, {
          notify: true,
          focus: false,
        });
        setState({ freeForm: false });
        fireEvent('pick', item.name, item, 0);
      });
    }
  }

  // initialize with instance options
  configure(initOptions);


  // Return instance
  // ----------------------------------------
  // read-only values
  Object.defineProperty(client, 'input', {
    get: () => input,
  });

  Object.defineProperty(client, 'options', {
    get: () => ({
      target,
      ...options,
      ...pk.options,
    }),
  });

  Object.defineProperty(client, 'handlers', {
    get: () => Object.fromEntries(handlers),
  });

  Object.defineProperty(client, 'state', {
    get: () => state,
  });

  // manually set input value
  client.setValue = (value, notify = false) => {
    setValue(value, {
      notify,
      focus: false,
    });
    return client;
  };

  // clear input value
  client.clear = clearInput;

  // register event handler
  client.on = (event, handler) => {
    if (!isString(event)) {
      throw (`Error: first argument 'event' must be a string.`);
    }
    if (typeof handler !== 'undefined' && !handler.call) {
      throw (`Error: second argument 'handler' must be a function if defined.`);
    }
    if (handler) {
      handlers.set(event, handler);
    } else if (handlers.has(event)) {
      handlers.delete(event);
    }
    return client;
  };

  // open suggestions panel
  client.open = () => {
    togglePanel(true);
    return client;
  };

  // close suggestions panel
  client.close = () => {
    togglePanel(false);
    return client;
  };

  // update options
  client.configure = (opts = {}) => {
    configure(opts);
    return client;
  };

  // request the device's location
  client.requestGeolocation = (opts = {}) => {
    return pk.requestGeolocation(opts).then((pos) => {
      setState({ geolocation: true }, true);
      fireEvent('geolocation', true, pos);
      setCountry(null); // force redetect country
      input.focus();
      search();
      return pos;
    }).catch((err) => {
      setState({ geolocation: false }, true);
      fireEvent('geolocation', false, undefined, err.message);
    });
  };

  // clear device's location
  client.clearGeolocation = () => {
    pk.clearGeolocation();
    setState({ geolocation: false });
    return client;
  };

  // unbind events and remove panel
  client.destroy = () => {
    input.removeEventListener('input', handleInput);
    input.removeEventListener('click', handleFocus);
    input.removeEventListener('focus', handleFocus);
    window.removeEventListener('keydown', handleKeyNav);
    window.removeEventListener('click', handleClickOutside);
    resizeObserver.unobserve(input);
    panel.remove();
  };

  return client;
}
