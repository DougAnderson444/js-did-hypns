# Demo

## Overview

Shows use of the `js-did-hyper` module.

The demo makes a copule of drives, replicates them to make sure Hyperdrive is working.


Then it builds a few DID docs, updates, repliactes, etc.

Then open up a new window, and copy-paste thar did:hyper:... into the first window.

You'll see the remote's DID appear below, which will match the second window.

This demo shows how to exchange DID docs between two peers.

Now that you have each other's DID docs, you have each others' crypto material and can send each othe rencrypted data.

Also, because it's using Hyperdrive, you keep each others' data online when the other is online.

Kind of cool, right?

## Build

`npm run build`

Then open `index.html` and watch the magic happen. 

Build bundles `main.js` into `bundle.js` using [Browserify](https://www.npmjs.com/package/browserify) and [Sveltify](https://www.npmjs.com/package/sveltify).