<script context="module">
  import { Post, preloader } from  "../../store"

  export const preload = preloader(Post, "post", "slug")
</script>

<svelte:head>
  <title>{$post.title}</title>
</svelte:head>

<div class="container mx-auto">
  <h1 on:click={_ => exclaim($post)}>{$post.title}</h1>

  {@html $post.html}
</div>

<script>
  import type { Readable } from "svelte/store"

  export let post: Readable<Post>

  const exclaim = (post: Post) => {
    post.title += "!"
    post.save()
  }
</script>