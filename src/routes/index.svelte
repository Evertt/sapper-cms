<script context="module">
  import Misc from "../store/Misc"
	import { preload as subPreload } from "./_components/MainView/index.svelte"

	export const preload = async () => {
    const results = await subPreload()
    const misc = Misc.find("misc")

    await misc

    return { ...results, misc }
  }
</script>

<svelte:head>
  <title>Conduit</title>
</svelte:head>

<div class="home-page">
  <div class="banner">
    <div class="container">
      <h1 class="logo-font">conduit</h1>
      <p>A place to share your knowledge.</p>
    </div>
  </div>

  <div class="container page">
    <div class="row">
      <MainView {articles} {tag} bind:tab />

      <div class="col-md-3">
        <div class="sidebar">
          <p>Popular Tags</p>
          <Tags tags={$misc.tags} on:select={setTags} />
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  import MainView from "./_components/MainView/index.svelte"
  import Tags from "./_components/Tags.svelte"

  export let articles: any
  export let misc = Misc.find("misc")

  let tab: string
  let tag: string|null

  function setTags({ detail }: any) {
    tag = detail.tag
    tab = "tag"
  }
</script>
