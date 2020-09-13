<script context="module">
  import { Post, preloader } from  "../../store"
  const posts = Post.query()
  export const preload = preloader(posts)
</script>

<div class="container">
  <ul>
    {#each $posts as post}
      <li><a href="/blog/{post.slug}" rel="prefetch">{post.title}</a><br/></li>
    {/each}
    <li><a href="/blog/404" rel="prefetch">Non-existend blog post...</a><br/></li>
  </ul>
</div>

<button on:click={addPost}>Add Post</button>

<script>
  const addPost = () => {
    const n = $posts.length

    const post = new Post({
      slug: `new-post-${n}`,
      title: `New Post ${n}`,
      html: "<p>Blablabla</p>",
    })

    post.save()
  }
</script>