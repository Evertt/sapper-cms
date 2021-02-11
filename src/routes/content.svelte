<script context="module">
  import { Page } from "../store"

	export const preload = async () => {
    const page = Page.find("home")
    await page

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
    <Content bind:data={$bla.content} {editting} />
  </div>

  <div class="toolbar">
    <button class="edit" class:hidden={editting} on:click={_ => editting = true}>Edit</button>

    {#if editting}
      <button class="stop" on:click={stop}>Stop editting</button>
      <button class="publish" on:click={commit} class:hidden={!$page.hasUnfinishedDraft}>
        Publish
      </button>
      <span class="status">{saveState}</span>
    {/if}
  </div>
</div>

<script>
  import Content from "../components/Content.svelte"
  import { throttle, isEqual } from "lodash-es"
  import { writable } from "svelte/store"
  export let page = Page.find("home")

  const saving = page.saving
  let saveState = ""
  let editting = false
  const bla = writable<any>($page)
  const setBla = bla.set

  bla.set = data => {
    setBla(data)
    if (editting) $page.draft = data
  }

  $: {
    const yada = editting ? $page.getDraft() : $page
    if (!isEqual(yada, $bla)) {
      $bla = yada
    }
  }

  const setSaveState = throttle((isSaving: boolean) => {
    if (isSaving) saveState = "saving..."
    else if (saveState === "saving...") {
      const time = (new Date).toTimeString()
        .match(/^[\d:]+( [ap]m)?/i)![0]
      saveState = `last saved at ${time}`
    }
  }, 400)

  $: setSaveState($saving)

  const stop = () => editting = false
  const commit = () => $page.publishDraft() && stop()
</script>

<style>
  :global(body) {
    @apply pb-12;
  }

  .toolbar {
    @apply fixed w-full bottom-0 shadow-md-up h-12;
  }

  button.publish {
    @apply bg-green-600 text-white p-4;

    &:disabled {
      @apply bg-gray-600;
    }
  }

  button.stop {
    @apply bg-blue-600 text-white p-4;
  }

  button.edit {
    @apply bg-green-600 text-white p-4;
  }

  span.status {
    @apply p-4 inline-block absolute right-0 h-full text-right;
  }
</style>