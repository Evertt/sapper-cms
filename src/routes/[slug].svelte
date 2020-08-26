<script context="module">
  import { collection } from "../store"
  import type { Model, Store } from "../store"

  type Post = Model & {
    slug: string,
    title: string,
    html: string,
    created?: Date,
    updated?: Date,
  }

  let posts: Store<Post> = collection<Post>("posts")
  type SlugParams = { params: { slug: string } }
  
  export function preload({ params }: SlugParams) {
    const { slug } = params
    posts = posts.where("slug", "==", slug) as Store<Post>

    return new Promise(
      (resolve) => posts.subscribe(
        ($posts) => $posts.length && resolve({ params }),
      ),
    )
  }
</script>

{#if $posts && $posts.length}
<div class="container mx-auto">
  <h1>{$posts[0].title}</h1>

  {@html $posts[0].html}
</div>
{/if}

<script>
  export let params: { slug: string }
  preload({ params })
</script>