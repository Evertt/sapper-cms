<svelte:head>
  <title>
    {segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Index"}
  </title>
</svelte:head>

<FetchWrapper />
<SessionObserver />
<UserObserver />

<slot />

<script>
  import FetchWrapper from "../components/FetchWrapper.svelte"
  import SessionObserver from "../components/SessionObserver.svelte"
  import UserObserver from "../components/UserObserver.svelte"
  export let segment: string = ""
</script>
