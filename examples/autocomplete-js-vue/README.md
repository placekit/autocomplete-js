# Vue integration example

[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/placekit/autocomplete-js/tree/main/examples/autocomplete-js-vue)

This example showcases a full address autocomplete field in [Vue.js](https://vuejs.org) with PlaceKit's default style. Vue, as opposed to React, has a quite straightforward integration due to its component lifecycle and state management.

## Run

```sh
# clone project and access this example
git clone git@github.com:placekit/autocomplete-js.git
cd autocomplete-js/examples/autocomplete-js-vue

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