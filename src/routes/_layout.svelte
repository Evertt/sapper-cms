<svelte:head>
  <title>
    {segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Index"}
  </title>
</svelte:head>

<FetchWrapper />
<SessionObserver />
<UserObserver />

<Modal>
  <Nav />

  <main>
    <slot />
  </main>

  {#if swReg && swReg.waiting}
    <div transition:slide class="fixed bottom-0 right-0 p-4 m-4 text-gray-200 bg-gray-800 rounded">
      A new version is available.
      <span class="mx-1 text-yellow-500 underline cursor-pointer" on:click={skipWaiting}>Refresh</span>
      <span class="text-yellow-500 underline cursor-pointer" on:click={_ => swReg = undefined}>Cancel</span>
    </div>
  {/if}
</Modal>

<script>
  import { onSWInstalled } from "../register-service-worker"
  import FetchWrapper from "../components/FetchWrapper.svelte"
  import SessionObserver from "../components/SessionObserver.svelte"
  import UserObserver from "../components/UserObserver.svelte"
  import Nav from "../components/Nav.svelte"
  import { slide } from "svelte/transition"
  import Modal from "svelte-simple-modal"
  export let segment = ""

  let swReg: ServiceWorkerRegistration|undefined

  const skipWaiting = () => {
    const swRegClone = swReg
    swReg = undefined
    swRegClone?.waiting?.postMessage("skipWaiting")
  }

  onSWInstalled(reg => setTimeout(() => swReg = reg, 2000))
</script>

<style global>
  @import "../styles/global.pcss";
</style>
