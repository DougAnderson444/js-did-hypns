# js-did-hyper

## Javascript Decentralized Indentifiers using [Hyperdrive](https://github.com/hypercore-protocol/hyperdrive/)

This is a javascript implementation of the [Decentralized Identity Document method](https://w3c-ccg.github.io/did-method-registry/#the-registry) implementation.

## Why?

Most of the DID method implementations I have seen are based on blockchains. I wanted an implementation that worked without having to buy cryptocurrency and then spend the crypto every time you want to change your DID Doc. Hyperdrive is truly peer-to-peer, and free to the user. 

So with this, anyone can create their own digital identity document and save it to their own machine. Theirs stays online as long as their computer is up, or any friends also have their computer running.

### Browser

My design goals included:
- [x] No download
- [x] No sign-up
- [x] No payment
- [x] Use existing accounts/assets/platforms

Much of this meant it had to work in the browser, to ease adoption

### HyperComponent

I developed a [Svelte HyperComponent](https://github.com/DougAnderson444/hyper-svelte-component) as well

> When using the Dat-SDK (Hyper-SDK) to create a Hyperdrive, you need to close it after you're done with it. 

Svelte has a built-in `onDestroy` feature that automatically calls a function when the component is destroyed. So by baking the SDK and Hyperdrive into a Svelte component, I can "set it and forget it" about calling the `await close()` after I'm done with the SDK.

## Document and Key Manager ("Wallet")

The demo shows how to interact with the `did-hyper` module and save DID doc details directly. In reality, you'll likely use a DID `wallet` to manage all this, like [https://github.com/DougAnderson444/streamlined-idm-wallet-sdk](https://github.com/DougAnderson444/streamlined-idm-wallet-sdk).

## Create, Read, Update and Delete did:hyper identities

You can create a DID doc by simply passing a hyperdrive into this module.

PRs welcome.
