// this script gets bundled by Browserify into bundle.js and included in index.html
const App = require('./App.svelte')

const app = new App({
  target: document.body,
  props: {
    SDK,
    name: 'world'
  }
})
