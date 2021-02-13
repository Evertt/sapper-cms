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

  <PageComponent {page} let:page let:editing let:change>
    <div class="container page grid grid-cols-2 gap-4">
      <Content data={page.content} {editing} on:change={change.content} />
      <Content data={page.content2} {editing} on:change={change.content2} />
    </div>
  </PageComponent>
</div>

<script>
  import Content from "../components/Content.svelte"
  import PageComponent from "../components/Page.svelte"

  export let page = Page.find("home")
</script>

<style>
  .grid > :global(div) {
    @apply bg-gray-100;
  }

  .grid :global(blockquote) {
    @apply ml-4 pl-4;
    border-left: 5px solid #ddd;
    line-height: 1.4;
  }
</style>