# js-did-hyper

## Javascript [Decentralized Identifiers](https://www.w3.org/TR/did-core/) using [Hyperdrive Protocol](https://github.com/hypercore-protocol/hyperdrive/)

## What

This is a javascript implementation of the [Decentralized Identity Document (DID Doc) method](https://w3c-ccg.github.io/did-method-registry/#the-registry) implementation.

*Pre-alpha level software. Use a your own risk.*

## Why?

Most of the DID method implementations I have seen are based on blockchains. I wanted an implementation that worked without having to buy cryptocurrency and then spend the crypto every time you want to change your DID Doc. Hyperdrive is truly peer-to-peer, and free to the user. 

So with this, anyone can create their own digital identity document and save it to their own machine. Theirs stays online as long as their computer is up, or any friends also have their computer running.

### Browser

My design goals included:
- [x] No download
- [x] No sign-up
- [x] No payment
- [x] Use existing accounts/assets/platforms

#1 No download: This meant it had to work in the browser, as everyone already has a browser downloaded

#2 It had to work anonymously and without any server involvement to register or sign-up.

#3 No payment. Why pay for hardware, processing, or storage when we all have phones, computers, and other hardware already at our disposal? Also, buyign cryptocurrency is a hassle, and a huge barrier to entry for most people.

#4 Use existing accounts/platforms. To ease adoption, right along with using the browser, the system uses existing user-owner hardware and already installed software.

### HyperComponent

To get the software to work in the browser, I needed a protocol that works peer to peer and automatically pins peers. The winner for mutable data is the Hyper Protocol. 

I developed a [Svelte HyperComponent](https://www.npmjs.com/package/hyper-svelte-component) as well since:

> When using the Dat-SDK (Hyper-SDK) to create a Hyperdrive, you need to close it after you're done with it. 

Svelte has a built-in `onDestroy` feature that automatically calls a function when the component is destroyed. So by baking the SDK and Hyperdrive into a Svelte component, I can "set it and forget it" about calling the `await close()` after I'm done with the SDK.

## Document and Key Manager ("Wallet")

The demo folder shows how to interact with the `did-hyper` module and save DID doc details directly. In reality, you'll likely use a DID `wallet` to manage all this, like [https://github.com/DougAnderson444/streamlined-idm-wallet-sdk](https://github.com/DougAnderson444/streamlined-idm-wallet-sdk) or any other DID doc management software.

## Create, Read, Update and Delete did:hyper identities

You can create a DID doc by simply passing a hyperdrive into this module.

PRs welcome, this is a work in progress.
