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
</Modal>

<script>
  import FetchWrapper from "../components/FetchWrapper.svelte"
  import SessionObserver from "../components/SessionObserver.svelte"
  import UserObserver from "../components/UserObserver.svelte"
  import Nav from "./_components/Nav.svelte"
  import Modal from "svelte-simple-modal"
  export let segment = ""
</script>

<style global>
  @import "../styles/global.pcss";
</style>