<script>
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';

	import placekitAutocomplete from '@placekit/autocomplete-js';
	import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

	let input;
	let client;
	let state;
	onMount(() => {
		client = placekitAutocomplete(env.PUBLIC_PLACEKIT_API_KEY, {
			target: input,
			countries: ['fr'],
		}).on('state', ({ ...newState }) => {
			state = newState; // spread to force update state with new value
		});

		// inject initial state from client
		state = { ...client.state }; // spread to force update state with new value
		return () => {
			client.destroy();
		};
	});
</script>

<div class="pka-input">
	<button
		type="button"
		title="Activate geolocation"
		role="switch"
		class="pka-input-geolocation"
		class:pka-enabled={state?.geolocation}
		aria-checked={state?.geolocation}
		on:click={client?.requestGeolocation}
	>
		<span class="pka-sr-only">Activate geolocation</span>
	</button>
	<button
		type="button"
		class="pka-input-clear"
		title="Clear value"
		aria-hidden={state?.empty}
		on:click={client?.clear}
	>
		<span class="pka-sr-only">Clear value</span>
	</button>
	<input
		bind:this={input}
		placeholder="Search places..."
		type="search"
	>
</div>