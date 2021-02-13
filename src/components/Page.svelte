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

<slot page={selectedContentProxy} {editing} />

<Fab on:click={_ => editing = !editing} {loading} {icon} />

<div class="toolbar">
  {#if editing}
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
  import { faEdit, faSyncAlt, faTimes } from "@fortawesome/free-solid-svg-icons"
  import Fab from "../components/FloatingActionButton.svelte"
  import { throttle, isEqual } from "lodash-es"
  import { writable, get } from "svelte/store"
  import type { Writable } from "svelte/store"
  import type { ModelQuery } from "rxfirestorm/dist/ModelQuery"
  export let page: ModelQuery<typeof Page>

  const saving = page.saving
  let saveState = ""
  let editing = false
  let icon = faEdit
  let loading = false
  const selectedContent = writable<any>($page)
  const setSelectedContent = selectedContent.set

  selectedContent.set = data => {
    setSelectedContent(data)
    if (editing) $page.draft = data
  }

  const selectedContentProxy: { [key: string]: Writable<any> } = new Proxy({}, {
    get(_, prop) {
      const store = writable<any>($selectedContent[prop])
      const ogSet = store.set

      store.set = data => {
        ogSet(data)
        $selectedContent[prop] = data
      }

      selectedContent.subscribe(newData => {
        if (!isEqual(newData[prop], get(store))) {
          store.set(newData[prop])
        }
      })

      return store
    }
  })

  $: {
    const newlySelectedContent = !editing ? $page.published : $page.draft || $page.published
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
  }, 750)

  $: setSaveState($saving)

  $: loading = saveState === "saving..."
  $: if (loading) {
    icon = faSyncAlt
  } else if (editing) {
    icon = faTimes
  } else {
    icon = faEdit
  }

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

  span.status {
    @apply p-4 inline-block absolute right-0 h-full text-right;
  }
</style>