<template>
  <div class="pka-input">
    <button
      type="button"
      title="Activate geolocation"
      role="switch"
      class="pka-input-geolocation"
      :class="{ 'pka-enabled': state.geolocation }"
      :aria-checked="state.geolocation"
      @click="toggleGeolocation"
    >
      <span class="pka-sr-only">Activate geolocation</span>
    </button>
    <button
      type="button"
      class="pka-input-clear"
      title="Clear value"
      :aria-hidden="state.empty"
      @click="client?.clear"
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
      state: {},
    };
  },
  methods: {
    toggleGeolocation: function() {
      if (this.client) {
        if (this.state.geolocation) {
          this.client.clearGeolocation();
        } else {
          this.client.requestGeolocation();
        }
      }
    },
  },
  mounted() {
    this.client = placekitAutocomplete(import.meta.env.VITE_PLACEKIT_API_KEY, {
      target: this.$refs.input,
      countries: ['fr'],
    })
      .on('state', (state) => {
        this.state = { ...state }; // spread to force update state with new value
      })

    // inject initial state from client
    this.state = { ...this.client.state }; // spread to force update state with new value
  },
  beforeUnmount() {
    if (this.client?.destroy?.call) {
      this.client.destroy();
    }
  },
};
</script>