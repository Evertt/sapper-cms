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

  <div class="container page grid grid-cols-2 gap-4">
    <Content bind:data={$selectedcontent.content} {editing} />
    <Content bind:data={$selectedcontent.content2} {editing} />
  </div>

  <Fab loading={saveState === "saving..."} icon={editing ? faSyncAlt : faEdit } />

  <div class="toolbar">
    <button class="edit" class:hidden={editing} on:click={_ => editing = true}>
      Edit page
      {#if $page.hasUnfinishedDraft}
        (has unfinished draft)
      {/if}
    </button>

    {#if editing}
      <button class="stopEditing" on:click={stopEditing}>Stop editing</button>
      <button class="publish" on:click={commit} disabled={!$page.hasUnfinishedDraft}>
        {#if $page.hasUnfinishedDraft}
          Publish
        {:else}
          (no changes to publish)
        {/if}
      </button>
      <span class="status">{saveState}</span>
    {/if}
  </div>
</div>

<script>
  import { faEdit, faSyncAlt } from "@fortawesome/free-solid-svg-icons"
  import Fab from "../components/FloatingActionButton.svelte"
  import Content from "../components/Content.svelte"
  import { throttle, isEqual } from "lodash-es"
  import { writable } from "svelte/store"
  export let page = Page.find("home")

  const saving = page.saving
  let saveState = ""
  let editing = false
  const selectedcontent = writable<any>($page)
  const setSelectedContent = selectedcontent.set

  selectedcontent.set = data => {
    setSelectedContent(data)
    if (editing) $page.draft = data
  }

  $: {
    const newlySelectedContent = editing && $page.draft ? $page.draft : $page.published
    if (!isEqual(newlySelectedContent, $selectedcontent)) {
      $selectedcontent = newlySelectedContent
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

  const stopEditing = () => editing = false

  const commit = async () => {
    page.saving.next(true)
    await $page.publishDraft()
    page.saving.next(false)
    stopEditing()
  }
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

  button.stopEditing {
    @apply bg-blue-600 text-white p-4;
  }

  button.edit {
    @apply bg-green-600 text-white p-4;
  }

  span.status {
    @apply p-4 inline-block absolute right-0 h-full text-right;
  }

  .grid > :global(div) {
    @apply outline-black;
  }
</style>