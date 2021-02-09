<script context="module">
  import { Page } from "../store"

	export const preload = async () => {
    const page = await Page.find("home")

    return { page }
  }
</script>

<svelte:head>
  <title>Content</title>
</svelte:head>

<div class="home-page">
  <div class="banner">
    <div class="container">
      <h1 class="logo-font">conduit</h1>
      <p>A place to share your knowledge.</p>
    </div>
  </div>

  <div class="container page">
    <div id="content">
      {@html page.body}
    </div>
  </div>
</div>

<script>
  import { onMount } from "svelte"

  export let page: Page

  onMount(async () => {
    if (!process.browser) return;
    const Quill = (await import("quill")).default
    const editor = new Quill("#content", {
      modules: { toolbar: true },
      theme: "bubble"
    })
  })
</script>

<style global>
  @import "quill/dist/quill.bubble.css";
</style>