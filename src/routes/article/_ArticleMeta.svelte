{#if $author}
  <div class="article-meta">
    <a href="/profile/@{$author.username}">
      <img src={$author.image} alt={$author.username} />
    </a>

    <div class="info">
      <a href="/profile/@{$author.username}" class="author"> {$author.username}</a>
      <span class="date">
        {article.createdAt.toDateString()}
      </span>
    </div>

    {#if canModify}
      <span>
        <a href="/editor/{article.slug}" class="btn btn-outline-secondary btn-sm">
          <i class="ion-edit"/> Edit Article
        </a>

        <button class="btn btn-outline-danger btn-sm" on:click="{remove}">
          <i class="ion-trash-a"/> Delete Article
        </button>
      </span>
    {/if}
  </div>
{/if}

<script>
  import type Article from "../../store/Article"
  import type User from "../../store/User"
  import { goto } from "@sapper/app"

  export let article: Article
  export let user: User|null
  
  let author = article.author
  $: author = article.author
  $: canModify = user && user.id === $author?.id

  function remove() {
    article.delete()
    goto("/")
  }
</script>
