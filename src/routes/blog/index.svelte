<script context="module">
  import { collection, preloader } from "../../store"
  import { Post } from  "../../store/Post"
  
  const posts = collection(Post)
  export const preload = preloader(posts)
</script>

<div class="container">
  <ul>
    {#each $posts as post}
      <li><a href="/blog/{post.slug}" rel="prefetch">{post.title}</a><br/></li>
    {/each}
  </ul>
</div>
