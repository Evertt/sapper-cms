<script context="module">
  import { Page } from "../store"

	export const pagePreload = (slug: string) => {
    return async () => {
      const page = Page.find(slug)
      await page

      return { page }
    }
  }
</script>

<slot page={$selectedContent} {editing} {change} />

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

<script>
  import { faEdit, faSyncAlt } from "@fortawesome/free-solid-svg-icons"
  import Fab from "../components/FloatingActionButton.svelte"
  import { throttle, isEqual } from "lodash-es"
  import { writable } from "svelte/store"
  import type { ModelQuery } from "rxfirestorm/dist/ModelQuery"
  export let page: ModelQuery<typeof Page>

  const changeMethod = (key: string) => (event: CustomEvent) => {
    $selectedContent[key] = event.detail
  }

  const change: any = new Proxy(changeMethod, {
    get(target, key: string) {
      return target(key)
    }
  })

  const saving = page.saving
  let saveState = ""
  let editing = false
  const selectedContent = writable<any>($page)
  const setSelectedContent = selectedContent.set

  selectedContent.set = data => {
    setSelectedContent(data)
    if (editing) $page.draft = data
  }

  $: {
    if (editing && !$page.draft) $page.draft = $page.published
    const newlySelectedContent = editing ? $page.draft : $page.published
    if (!isEqual(newlySelectedContent, $selectedContent)) {
      $selectedContent = newlySelectedContent
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
</style>