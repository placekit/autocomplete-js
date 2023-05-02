<template>
  <div class="pka-input">
    <button
      type="button"
      title="Activate geolocation"
      role="switch"
      class="pka-input-geolocation"
      :class="{ 'pka-enabled': hasGeolocation }"
      :aria-checked="hasGeolocation"
      :onClick="client?.requestGeolocation"
    >
      <span class="pka-sr-only">Activate geolocation</span>
    </button>
    <button
      type="button"
      class="pka-input-clear"
      title="Clear value"
      :aria-hidden="isEmpty"
      :onClick="client?.clear"
    >
      <span class="pka-sr-only">Clear value</span>
    </button>
    <input
      ref="input"
      placeholder="Search places..."
      type="search"
    >
  </div>
</template>

<script>
import placekitAutocomplete from '@placekit/autocomplete-js';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

export default {
  data() {
    return {
      client: {},
      isEmpty: true,
      isFreeForm: true,
      hasGeolocation: false,
    };
  },
  mounted() {
    this.client = placekitAutocomplete(import.meta.env.VITE_PLACEKIT_API_KEY, {
      target: this.$refs.input,
      countries: ['fr'],
    })
      .on('empty', (bool) => {
        this.isEmpty = bool
      })
      .on('geolocation', (bool) => {
        this.hasGeolocation = bool;
      });
  },
  beforeUnmount() {
    if (this.client?.destroy?.call) {
      this.client.destroy();
    }
  },
};
</script>