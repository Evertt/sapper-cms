<script context="module">
  import { collection, preloader } from "../store"
  import type { Model } from "../store"

  type Post = Model & {
    title: string,
    body: string,
    created?: Date,
    updated?: Date,
  }

  const posts = collection<Post>("posts")
  export const preload = preloader(posts)
</script>

<script>
  import ExampleComponent from "../components/ExampleComponent.svelte"
</script>

<style>
  .centerer {
    @apply flex-1 flex flex-col items-center justify-center mx-auto w-full bg-gray-100 md:max-w-xl;
  }

  div {
    @apply hover:bg-red-200;
  }
</style>

<div class:centerer={true}> <!-- Here's how you could extract conditional class groups with @apply -->
  <ExampleComponent
    title="🌐 Opinionated Sapper project base"
    paragraph="This is an example route and component to make sure everything's working." />

  <a
    class="mt-10 p-3 rounded-lg shadow-md text-pink-800 bg-pink-200 transition
    duration-200 ease-in-out hover:bg-pink-300 focus:bg-pink-300
    focus:outline-none focus:shadow-outline"
    href="/graphql">
    Check out the GraphQL playground!
  </a>

  <ul>
    {#each $posts as post}
      <li>{post.title}</li>
    {/each}
  </ul>
</div>
