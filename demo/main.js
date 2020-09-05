// this script gets bundled by Browserify into bundle.js and included in index.html
const App = require("./App.svelte");

const app = new App({
  target: document.body,
  props: {
    SDK,
    name: "world",
  },
});

//export default app;

/*
const Hyperdrive = require("./Hyperdrive.svelte");

// SDK is set in index.html from the dat-sdk
const drive = new Hyperdrive({
  target: document.querySelector(`#hyper-id`),
  props: {
    SDK: SDK,
    name: "mundo"
  },
});
*/

// Can also set properties this way
// hyperId.$set({ SDK: SDK });
