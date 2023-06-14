# Svelte integration example

[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/placekit/autocomplete-js/tree/main/examples/autocomplete-js-svelte)

This example showcases a full address autocomplete field in [Svelte](https://svelte.dev) with PlaceKit's default style. Svelte, as opposed to React, has no virtual DOM, making it easy to bind third-party libraries.

Only using [TailwindCSS](https://tailwindcss.com) as a convenience for the basic styling of the example.

## Run

```sh
# clone project and access this example
git clone git@github.com:placekit/autocomplete-js.git
cd autocomplete-js/examples/autocomplete-js-svelte

# install dependencies
npm install

# create .env file
cp .env.sample .env
```

Open the `.env` file and replace `<your-api-key>` with your PlaceKit API key.

Then run:

```sh
npm run dev
```

And your project will be served at http://localhost:5173.