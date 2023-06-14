<script>
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';

	import placekitAutocomplete from '@placekit/autocomplete-js';
	import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

	let input;
	let client;
	onMount(() => {
		client = placekitAutocomplete(env.PUBLIC_PLACEKIT_API_KEY, {
			target: input,
			countries: ['fr'],
		});
		client.on('pick', (_, item) => {
			alert(JSON.stringify(item, null, 2));
		});
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
		class:pka-enabled={client?.state.geolocation}
		aria-checked={client?.state.geolocation}
		on:click={client?.requestGeolocation}
	>
		<span class="pka-sr-only">Activate geolocation</span>
	</button>
	<button
		type="button"
		class="pka-input-clear"
		title="Clear value"
		aria-hidden={client?.state.empty}
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