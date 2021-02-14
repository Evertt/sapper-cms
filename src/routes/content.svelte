<script context="module">
  import PageComponent, { pagePreload } from "../components/Page.svelte"
  export const preload = pagePreload("home")
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

  <PageComponent {page} let:page let:editing>
    <div class="container page grid grid-cols-2 gap-4">
      <Content data={page.content} {editing} />
      <Content data={page.content2} {editing} />
    </div>
    <div class="image">
      <Image data={page.plaatje} {editing} />
    </div>
  </PageComponent>
</div>

<script>
  import Image from "../components/Image.svelte"
  import Content from "../components/Content.svelte"
  import { Page } from "../store"

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

  .image {
    @apply m-12 h-64 w-56;
  }
</style>