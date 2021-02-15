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

{#if 1 || $session.user}
  <Fab on:click={_ => editing = !editing} {loading} {icon} {text}
    on:mouseenter={_ => hover = true} on:mouseleave={_ => hover = false}
    on:commit={commit} canCommit={$page.hasUnfinishedDraft}
  />
{/if}

<script>
  import { faEdit, faSyncAlt, faTimes } from "@fortawesome/free-solid-svg-icons"
  import Fab from "../components/FloatingActionButton.svelte"
  import { throttle, isEqual } from "lodash-es"
  import { writable, get } from "svelte/store"
  import type { Writable } from "svelte/store"
  import type { ModelQuery } from "rxfirestorm/dist/ModelQuery"
  import { stores } from "@sapper/app"
  export let page: ModelQuery<typeof Page>

  const { session } = stores()

  const saving = page.saving
  let saveState = ""
  let editing = false
  let icon = faEdit
  let loading = false
  let text = ""
  let hover = false
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

  const setSaveState = throttle((isSaving: boolean|null) => {
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

  $: if (hover) {
    const extra = $page.hasUnfinishedDraft ? "" : "(nothing changed)"
    text = editing ? `click to stop editing ${extra}` : "click to start editing"
  } else if (editing) {
    text = saveState
  } else if ($page.hasUnfinishedDraft) {
    text = "has unfinished draft"
  } else {
    text = ""
  }

  const stopEditing = () => editing = false

  const commit = async () => {
    page.saving.next(true)
    await $page.publishDraft()
    page.saving.next(false)
    stopEditing()
  }
</script>
