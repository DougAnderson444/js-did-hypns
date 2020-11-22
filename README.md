# js-did-hyper / js-did-hypns

## Javascript [Decentralized Identifiers](https://www.w3.org/TR/did-core/) using [Hyperdrive Protocol](https://github.com/hypercore-protocol/hyperdrive/)

A HyperId = HyperdDID + HyPNS HyperNode + A Keypair

## What

This is a javascript implementation of the [Decentralized Identity Document (DID Doc) method](https://w3c-ccg.github.io/did-method-registry/#the-registry) implementation.

_Pre-alpha level software. Use a your own risk._

It uses a [fork](https://github.com/DougAnderson444/hypermultifeed) of [kappa-db/multifeed](https://github.com/kappa-db/multifeed) (because [waiting](https://github.com/kappa-db/multifeed/pull/45)) which incorporates [hypercore](https://www.npmjs.com/package/hypercore), [corestore](https://www.npmjs.com/package/corestore), and [networker](https://www.npmjs.com/package/@corestore/networker).

Multifeed was used because I want to be able to update my feed from any of my devices, as well as have backups. May switch to a HyPNS based [multi-hyperbee](https://github.com/tradle/multi-hyperbee) later.

## Why?

Most of the DID method implementations I have seen are based on blockchains. I wanted an implementation that worked without having to buy cryptocurrency and then spend the crypto every time you want to change your DID Doc. Hypercore-protocol is truly peer-to-peer, and free to the user.

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

### HypnsComponent

To get the software to work in the browser, I needed a protocol that works peer to peer and automatically pins peers. The winner for mutable data is the Hypercore-Protocol.

I developed a [Svelte HyperComponent](https://www.npmjs.com/package/hypns-svelte-component) as well to make working with Hyper and Multifeed easier.

Svelte has a built-in `onDestroy` feature that automatically calls a function when the component is destroyed. So by baking the SDK and Hyperdrive into a Svelte component, I can "set it and forget it" about calling the `await close()` after I'm done with the SDK. See HyPNS for more details.

## API

```js
import { createDidHyper, getDid } from "js-did-hyper";
import HyPNS from 'hypns' // or use the HyPNS-Svelte-Component in Svelte!

var myNode = new HyPNS({ persist: false })
const myInstance = await myNode.open({ keypair }) // or leave empty to generate new pair
await myInstance.ready() // must wait for it to configure

// initate the hyperId object using the node
hyperId = createDidHyper(myNode);

const createOps = (document) => {
  document.addPublicKey({
    id: "master",
    type: "RsaVerificationKey2018",
    publicKeyHex: keypair.publicKey.toString('hex'),
  });
};

// make a DID doc on this HyPNS instance
const initialDocument = await hyperId.create(myInstance, operations)

const updateOps = (document) => {
  document.addPublicKey({
    id: "secondary",
    type: "RsaVerificationKey2018",
    publicKeyHex: "someOtherHexPublicKeyHere",
  });
};

// update an existing DID doc on this drive
updatedContents = await hyperId.update(myInstance, updateOps);

// get the DID of this drive
did = await getDid(myInstance);
// did:hyper:abc123def....

// get the DID Doc of this DID (if possible)
resolveSelfContents = await hyperId.resolve(did);
// the actual DID doc with all the keys, methods, services, etc.

// get the DID Doc of a peer
peersContents = await hyperId.resolve("did:hyper:123cba456def...");


```

## Document and Key Manager ("Wallet")

TODO: demo needs updating

The demo folder shows how to interact with the `did-hyper` module and save DID doc details directly. In reality, you'll likely use a DID `wallet` to manage all this, like [https://github.com/DougAnderson444/streamlined-idm-wallet-sdk](https://github.com/DougAnderson444/streamlined-idm-wallet-sdk) or any other DID doc management software.

## Create, Read, Update and Delete did:hyper identities

You can create a DID doc by simply passing a hyperdrive into this module.

PRs welcome, this is a work in progress.
