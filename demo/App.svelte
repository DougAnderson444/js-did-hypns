<script>
  import { onMount } from "svelte";
  const HyperComponent = require("hyper-svelte-component");
  const ObjectComp = require("./ObjectComp.svelte");
  import createDidHyper, { getDid } from "js-did-hyper";
  const once = require("events.once"); // polyfill for nodejs events.once in the browser
  //const { once } = require("events"); //doesn't work, need the polyfill for browsers

  export let SDK; // passed from App.svelte, which comes from window.datSDK in index.html
  export let makeDrives; // passed from <Hyperdrive > binding
  export let makeDriveCopies;
  const RAI = require("random-access-idb");
  const storage = RAI("hyperId-" + new Date(Date.now()).toLocaleString());

  let sdkOpts = { persist: true, storage };
  let sdkOpts2 = { persist: false };

  let hyperId;
  let dougsDrive, rangersDrive;
  let dougsDid, rangersDid;
  let copyDrive;
  let promise1 = new Promise((resolve, reject) => {});
  let promise2 = new Promise((resolve, reject) => {});
  let promise3 = new Promise((resolve, reject) => {});

  let did,
    resolveSelfContents,
    initialContents,
    updatedContents,
    drive,
    key,
    buddy,
    peerDid,
    disabled;

  onMount(async () => {
    // This will run your code
  });

  // make a couple of named drives
  const makeEm = async () => {
    console.log("make 'em cowboy'...");
    dougsDrive = makeDrives("Doug");
    promise1 = await dougsDrive.ready();

    rangersDrive = makeDrives("Ranger");
    promise2 = await rangersDrive.ready();

    // try a copy
    copyDrive = makeDriveCopies(dougsDrive.key);
    promise3 = await copyDrive.ready();

    // Wait for the connection to be made
    if (!copyDrive.peers.length) {
      console.log("no peers yet, waiting for them...");
      copyDrive.on("peer-open", peer => {
        console.log(
          "A) Connected to peer",
          peer.remotePublicKey.toString("hex")
        );
      });
      const [peer] = await once(copyDrive, "peer-open"); //timeout?
      console.log(
        "B) Connected to peer:: ",
        peer.remotePublicKey.toString("hex")
      );
    }

    doDid();
  };

  const doDid = async () => {
    try {
      // use that drive to make a hyperId
      hyperId = createDidHyper(makeDrives);

      const createOps = document => {
        document.addPublicKey({
          id: "master",
          type: "RsaVerificationKey2018",
          publicKeyPem: "master.publicKey"
        });
      };

      initialContents = await hyperId.create(dougsDrive, createOps);

      const updateOps = document => {
        document.addPublicKey({
          id: "secondary",
          type: "RsaVerificationKey2018",
          publicKeyPem: "secondary.publicKey"
        });
      };

      updatedContents = await hyperId.update(dougsDrive, updateOps);

      // get the DID of this drive
      did = await getDid(dougsDrive);

      // get the DID Doc of this DID (if possible)
      resolveSelfContents = await hyperId.resolve(did);
    } catch (error) {
      if (error.code === "INVALID_DOCUMENT") {
        throw error;
      }
      if (error.code === "INVALID_DID") {
        throw error;
      }
      console.log(error);
    }
  };

  // once makeDrives is ready, trigger make'em
  $: if (makeDrives) makeEm();

  const handleSubmit = async () => {
    if (peerDid && peerDid.length > 64) {
      disabled = true;
      buddy = "";
      const resolveBuddyContents = await hyperId.resolve(peerDid);
      buddy = resolveBuddyContents;
      disabled = false;
    }
  };
</script>

<style>
  main {
    text-align: left;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<HyperComponent {SDK} bind:Hyperdrive={makeDrives} {sdkOpts} />
<HyperComponent {SDK} bind:Hyperdrive={makeDriveCopies} sdkOpts={sdkOpts2} />

<main>
  <h1>Demo the HyperDid!</h1>
  <p>This is a basic demo of how to interact with js-did-hyper.</p>
  <p>
    We've made the following drives from the dat-SDK
    <br />
    <br />
    {#if dougsDrive}
      {#await promise1}
        Loading Doug's Drive
      {:then resolved}
        Doug's Drive: {dougsDrive.key.toString('hex')}
      {:catch error}
        <!-- promise was rejected -->
        <p>Something went wrong: {error.message}</p>
      {/await}
    {/if}
    <br />
    <br />
    {#if rangersDrive}
      {#await promise2}
        Loading Ranger's Drive
      {:then resolved}
        Ranger's Drive: {rangersDrive.key.toString('hex')}
      {:catch error}
        <!-- promise was rejected -->
        <p>Something went wrong: {error.message}</p>
      {/await}
    {/if}
  </p>
  <p>
    {#if dougsDid}
      {#await dougsDid}
        Loading Ranger's Drive
      {:then resolved}
        Ranger's Drive: {dougsDid}
      {:catch error}
        <!-- promise was rejected -->
        <p>Something went wrong: {error.message}</p>
      {/await}
    {/if}
  </p>
  <p>
    {#if copyDrive}
      {#await promise3}
        Loading Copy of Doug's Drive
      {:then resolved}
        Copy's Drive: {copyDrive.key.toString('hex')} (matches Doug: {copyDrive.key.toString('hex') == dougsDrive.key.toString('hex')})
        <br />
        Writable: {copyDrive.writable}
      {:catch error}
        <!-- promise was rejected -->
        <p>Something went wrong: {error.message}</p>
      {/await}
    {/if}
  </p>
  {#if initialContents}
    <p>
      Created initial contents
      <br />
      <ObjectComp
        val={initialContents}
        key="Initial Contents (Click to expand)" />
    </p>
  {/if}
  {#if updatedContents}
    <p>
      Updated to contents:
      <br />
      <ObjectComp
        val={updatedContents}
        key="Updated Contents (Click to expand)" />
    </p>
  {/if}
  {#if did}
    <p>
      Get the DID of this drive:
      <br />
      {did}
    </p>
  {/if}
  {#if resolveSelfContents}
    <p>
      Resolve the content from that DID:
      <br />
      <ObjectComp
        val={resolveSelfContents}
        key="Resolved Contents (Click to expand)" />
    </p>
    <p>
      ...which should be the same as the last update: {JSON.stringify(resolveSelfContents) == JSON.stringify(updatedContents)}
    </p>
  {/if}
  <div>
    <form class="form" on:submit|preventDefault={handleSubmit}>
      Get a peer's DID Doc (enter their did:hyper:abc123abc123...):
      <br />
      <input
        type="text"
        on:click|preventDefault={handleSubmit}
        bind:value={peerDid}
        {disabled} />
    </form>
  </div>
  {#if disabled}Loading... just a second...{/if}
  {#if buddy}
    <p>
      Show Buddy's DID Doc Content:
      <br />
      <ObjectComp
        val={buddy}
        key="Resolved Contents from Peer (Click to expand)" />

    </p>
  {/if}
</main>
