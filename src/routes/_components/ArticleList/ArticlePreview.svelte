{#if $author}
  <div class="article-preview">
    <div class="article-meta">
      <a href='/profile/@{$author.username}'>
        <img src={$author.image} alt={$author.username} />
      </a>

      <div class="info">
        <a class="author" href='/profile/@{$author.username}'> {$author.username}
        </a>
        <span class="date">
          {article.createdAt.toDateString()}
        </span>
      </div>

      {#if user}
        <div class="pull-xs-right">
          <button class='btn btn-sm {article.favorited ? "btn-primary" : "btn-outline-primary"}' on:click={toggleFavorite}>
            <i class="ion-heart"></i> {article.favoritesCount}
          </button>
        </div>
      {/if}
    </div>

    <a href='/article/{article.slug}' rel='prefetch' class="preview-link">
      <h1>{article.title}</h1>
      <p>{article.description}</p>
      <span>Read more...</span>
      <ul class="tag-list">
        {#each article.tagList as tag}
          <li class="tag-default tag-pill tag-outline">
            {tag}
          </li>
        {/each}
      </ul>
    </a>
  </div>
{/if}

<script>
  import { onDestroy } from "svelte"
  import type User from "../../../store/User"
  import type Article from "../../../store/Article"
  
  export let article: Article
  export let user: User

  // for proper preloading it's important
  // to immediately assign this variable.
  let author = article.author

  // And for live data updates it's of course important
  // to bind / subscribe this variable to article.author.
  $: if (author.id !== article.author.id) {
    author.unsubscribe()
    author = article.author
  }

  onDestroy(author.unsubscribe)

  async function toggleFavorite() {
    // optimistic UI
    if (article.favorited) {
      article.favoritesCount -= 1
      article.favorited = false
    } else {
      article.favoritesCount += 1
      article.favorited = true
    }

    await article.save("update")
  }
</script>
