<script context="module">
  import { collection, preloader } from "../store"
  import type { Model } from "../store"

  type Post = Model & {
    slug: string,
    title: string,
    html: string,
    created?: Date,
    updated?: Date,
  }

  const posts = collection<Post>("posts")
  export const preload = preloader(posts)
</script>

<div class:centerer={true}> <!-- Here's how you could extract conditional class groups with @apply -->
  <ExampleComponent
    title="🌐 Opinionated Sapper project base"
    paragraph="This is an example route and component to make sure everything's working." />

  <a class="button" href="/graphql">Check out the GraphQL playground!</a>

  <ul>
    {#each $posts as post}
      <li><a href="/{post.slug}">{post.title}</a><br/></li>
    {/each}
  </ul>
</div>

<script>
  import ExampleComponent from "../components/ExampleComponent.svelte"
</script>

<style>
  .centerer {
    @apply flex-1 flex flex-col items-center justify-center;
  }

  .button {
    @apply mt-10 p-3 rounded-lg shadow-md text-pink-800 bg-pink-200 transition duration-200 ease-in-out hover:bg-pink-300 focus:bg-pink-300 focus:outline-none focus:shadow-outline;
  }
</style>
