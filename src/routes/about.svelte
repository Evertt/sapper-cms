<script context="module">
  import { pagePreload } from "../components/Page.svelte"
  export const preload = pagePreload("about")
</script>

<svelte:head>
  <title>Content</title>
  <meta name="description" content="This is a demonstration of a sort-of inline CMS">
</svelte:head>

<PageComponent {page} let:page let:editing>
  <div class="home-page">
    <div class="banner">
      <div class="container">
        <h1 class="logo-font">conduit</h1>
        <p>A place to share your knowledge.</p>
      </div>
    </div>

    <div class="container grid grid-cols-2 gap-4 page">
      <Content data={page.content} {editing} />
      <Content data={page.content2} {editing} />
    </div>
    <div class="image">
      <Image data={page.plaatje} {editing} />
    </div>
  </div>
</PageComponent>

<script>
  import { Page } from "../store"
  import Image from "../components/Image.svelte"
  import Content from "../components/Content.svelte"
  import PageComponent from "../components/Page.svelte"

  export let page = Page.find("about")
</script>

<style>
  .grid > :global(div) {
    @apply bg-gray-100 px-4 py-2;
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