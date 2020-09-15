<script>
  import MainView from "./MainView/index.svelte"
  import Tags from "./Tags.svelte"
  import Misc from "../../store/Misc"

  export let p = 1

  let tab: string
  let tag: string|null
  let tags: string[]|undefined
  const misc = Misc.find("misc")

  function setTags({ detail }: any) {
    tag = detail.tag
    tab = "tag"
  }
  
  $: tags = $misc?.tags
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
      <MainView {p} {tag} bind:tab />

      <div class="col-md-3">
        <div class="sidebar">
          <p>Popular Tags</p>
          <Tags {tags} on:select={setTags} />
        </div>
      </div>
    </div>
  </div>
</div>