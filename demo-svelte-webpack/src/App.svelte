<script>
  import { onMount, onDestroy } from "svelte";
  import createDidHyper, { resolve, getDid } from "js-did-hyper";
  import SDK from "dat-sdk";
  import ObjectComp from "./ObjectComp.svelte";
  import { DID_DOC_FILENAME } from "js-did-hyper/src/constants";
  import { once } from "events";

  let did,
    resolveSelfContents,
    driveName,
    initialContents,
    updatedContents,
    drive,
    key,
    buddy,
    value;

  onMount(async () => {
    try {
      // create the hyperdrive
      var { Hyperdrive: Hyperdrive1, close: close1 } = await SDK({
        persist: false
      });

      // make a named drive, save the drive & drive name to keep using this DID
      driveName = "Doug-Laptop-DID-Drive";
      drive = Hyperdrive1(driveName);

      // Before using functions of the drive,
      // It's good to wait for it to fully loaded
      await drive.ready();

      key = drive.key.toString("hex");

      // use that drive to make a hyperId
      const hyperId = createDidHyper(drive);

      const createOps = document => {
        document.addPublicKey({
          id: "master",
          type: "RsaVerificationKey2018",
          publicKeyPem: "master.publicKey"
        });
      };

      initialContents = await hyperId.create(createOps);

      const updateOps = document => {
        document.addPublicKey({
          id: "secondary",
          type: "RsaVerificationKey2018",
          publicKeyPem: "secondary.publicKey"
        });
      };

      updatedContents = await hyperId.update(updateOps);

      // get the DID of this drive
      did = await getDid(drive);

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
    } finally {
      // App.svelte
      await close1();
    }

    const handleDestroy = () => {};

    return handleDestroy;
  });

  const handleSubmit = async () => {
    if (value && value.length == 64) {
      var { Hyperdrive: Hyperdrive2, close: close2 } = await SDK({
        persist: false
      });

      // Load the drive on the second peer using the key
      const copy = Hyperdrive2(value);

      await copy.ready();

      console.log("Loaded drive on other peer", copy.key.toString("hex"));

      if (copy.peers.length) {
        console.log("Already found peers for drive");
      } else {
        console.log("Waiting for peers to connect");
        copy.on("peer-open", () => {
          console.log("peer opened!");
        });
        const [peer] = await once(copy, "peer-open");
        // You can get a peer's identity from their public key in the connection
        console.log("Connected to peer", peer.remotePublicKey);
      }

      const contents = await copy.readFile(DID_DOC_FILENAME, "utf8");
      buddy = contents;
      console.log("Copy Read file from original", { contents });
    }
  };
</script>

<style>
  h1 {
    color: purple;
  }
</style>

<h1>Hello!</h1>

{#if key}
  <p>
    Key is
    <br />
    {key}
  </p>
{/if}
<p>
  Created {driveName} with initial contents
  <br />
  <ObjectComp val={initialContents} key="Initial Contents (Click to expand)" />
</p>
<p>
  Updated to contents:
  <br />
  <ObjectComp val={updatedContents} key="Updated Contents (Click to expand)" />
</p>
<p>
  Get the DID of this drive:
  <br />
  {did}
</p>
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

<div>
  <form>
    Get a peer's DID Doc:
    <br />
    <input type="text" on:click={handleSubmit} bind:value />
  </form>
</div>
<p>
  Buddy:
  <br />
  <ObjectComp val={buddy} key="Resolved Contents from Peer (Click to expand)" />

</p>
