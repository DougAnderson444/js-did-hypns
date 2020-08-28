<script>
  import { onMount, onDestroy } from "svelte";
  import createDidHyper, { resolve, getDid } from "js-did-hyper";
  import SDK from "dat-sdk";

  let did, resolveContents, driveName, initialContents, updatedContents;

  onMount(async () => {
    try {
      // create the hyperdrive
      var { Hyperdrive, close } = await SDK({
        persist: false // make true if you want to use this DID in real life
      });

      // make a named drive, save the drive & drive name to keep using this DID
      driveName = "Doug-Laptop-DID-Drive";
      const drive = Hyperdrive(driveName);

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
      resolveContents = await resolve(did);
    } catch (error) {
      if (error.code === "INVALID_DOCUMENT") {
        throw error;
      }
      if (error.code === "INVALID_DID") {
        throw error;
      }
    } finally {
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
<p>
  Created {driveName} with initial contents
  <br />
  {initialContents}
</p>
<p>
  Updated to contents:
  <br />
  {updatedContents}
</p>
<p>
  Get the DID of this drive:
  <br />
  {did}
</p>
<p>
  Resolve the content from that DID:
  <br />
  {resolveContents}
</p>
<p>
  ...which should be the same as the last update: {resolveContents == updatedContents}
</p>
