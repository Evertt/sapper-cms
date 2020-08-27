<script context="module">
  import { model } from "../store"
  import { Post } from  "../store/Post"
  
  export function preload({ params }: any) {
    const slug: string = params.slug
    const post = model(Post).where("slug", "==", slug)

    return new Promise(
      resolve => post.subscribe(
        $post => $post != null && resolve({ post }),
      ),
    )
  }
</script>

{#if $post}
  <div class="container mx-auto">
    <h1>{$post.title}</h1>

    {@html $post.html}
  </div>
{/if}

<script>
  import type { Model } from "../store"
  
  export let post: Model<Post>
</script>