<script>
  import { onMount, onDestroy } from "svelte";

  // passed down from Parent component
  export let SDK;
  export let sdkOpts = {
    persist: false
  };

  // pass up to parent for use
  export let Hyperdrive;
  let sdk;

  onMount(async () => {
    sdk = await SDK(sdkOpts);
    Hyperdrive = sdk.Hyperdrive;

    // Close the SDK connection if the browser is closed
    window.addEventListener("unload", async event => {
      await sdk.close();
    });
  });

  // this function will be called automatically when mounted svelte component is destroyed
  onDestroy(async () => await sdk.close());
</script>
