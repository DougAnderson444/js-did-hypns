<script>
  import { onMount } from "svelte";

  import HyPNSComp from "hypns-svelte-component";
  import ObjectComp from "./ObjectComp.svelte";
  import { createDidHyper, getDid } from "js-did-hyper";

  let hypnsNode;
  let hyperId;
  let myInstance
  let did,
    resolveSelfContents,
    initialContents,
    updatedContents,
    buddy,
    peerDid,
    disabled;

  onMount(() => {
    mounted = true;
  });

  // wait for both mount and node to be ready before makign them
  $: mounted && hypnsNode ? makeEm() : null;

  // make a couple of named drives
  const makeEm = async () => {
    console.log("make 'em cowboy'...");

    myInstance = await hypnsNode.open(); // open a new myInstance
    await myInstance.ready();
    console.log("first instance is ready!");

    try {
      // use that drive to make a hyperId
      hyperId = createDidHyper(hypnsNode);

      const createOps = (document) => {
        document.addPublicKey({
          id: "master",
          type: "RsaVerificationKey2018",
          publicKeyHex: myInstance.publicKey,
        });
      };

      initialContents = await hyperId.create(myInstance, createOps);

      const updateOps = (document) => {
        document.addPublicKey({
          id: "secondary",
          type: "RsaVerificationKey2018",
          publicKeyHex: "secondary.publicKey",
        });
      };

      updatedContents = await hyperId.update(myInstance, updateOps);

      // get the DID of this drive
      did = getDid(myInstance);

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

<HyPNSComp bind:hypnsNode />

<main>
  <h1>Demo the HyperDid!</h1>
  <p>This is a basic demo of how to interact with js-did-hyper.</p>
  <p>
    We've made the following drives from the dat-SDK
    <br />
    <br />
    {#if myInstance}
      {#await myInstance}
        Loading my node
      {:then resolved}
        Doug's Drive:
        {myInstance.key.toString('hex')}
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
    <p>Get the DID of this hypns instance: <br /> {did}</p>
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
      ...which should be the same as the last update:
      {JSON.stringify(resolveSelfContents) == JSON.stringify(updatedContents)}
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
