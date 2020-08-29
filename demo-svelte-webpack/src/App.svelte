<script>
  import { onMount, onDestroy } from "svelte";
  import createDidHyper, { resolve, getDid } from "js-did-hyper";
  import SDK from "dat-sdk";
  import ObjectComp from "./ObjectComp.svelte";

  let did,
    resolveContents,
    driveName,
    initialContents,
    updatedContents,
    drive,
    key;

  onMount(async () => {
    try {
      // create the hyperdrive
      var { Hyperdrive, close } = await SDK({
        persist: false // make true if you want to use this DID in real life
      });

      // make a named drive, save the drive & drive name to keep using this DID
      driveName = "Doug-Laptop-DID-Drive";
      drive = Hyperdrive(driveName);

      // Before using functions of the drive,
      // It's good to wait for it to fully loaded
      await drive.ready();

      key = drive.key.toString("hex");

      // use that drive to make a hyperId
      const hyperId = createDidHyper(drive);
      console.log(`hyperId`, hyperId);

      const createOps = document => {
        document.addPublicKey({
          id: "master",
          type: "RsaVerificationKey2018",
          publicKeyPem: "master.publicKey"
        });
      };

      console.log(`createOps`, createOps);
      initialContents = await hyperId.create(createOps);
      console.log(`initialContents`, { initialContents });

      const updateOps = document => {
        document.addPublicKey({
          id: "secondary",
          type: "RsaVerificationKey2018",
          publicKeyPem: "secondary.publicKey"
        });
      };

      console.log(`updateOps`, { updateOps });
      updatedContents = await hyperId.update(updateOps);

      // get the DID of this drive
      did = await getDid(drive);

      // get the DID Doc of this DID (if possible)
      resolveContents = await resolve(did);

      const handleDestroy = () => {};

      return handleDestroy;
      
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
      await close();
    }
  });
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
  <ObjectComp val={resolveContents} key="Resolved Contents (Click to expand)" />
</p>
<p>
  ...which should be the same as the last update: {JSON.stringify(resolveContents) == JSON.stringify(updatedContents)}
</p>
