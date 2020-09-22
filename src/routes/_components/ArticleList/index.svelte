<script context="module">
  export const preload = async () => {
    const articles = Article.query()
      .limit(10).orderBy("createdAt", "desc")

    // Preload the article and all
    // the related authors as well.
    await Promise.all((await articles).map(
      async article => await article.author
    ))

    return { articles }
  }
</script>

{#if $articles}
  {#if $articles.length === 0}
    <div class="article-preview">
      No articles are here... yet.
    </div>
  {:else}
    <div>
      {#each $articles as article (article.id)}
        <ArticlePreview {article} user={$session.user}/>
      {/each}

      <div class="pagination">
        <button on:click={prevPage}>&larr;</button>

        <!-- {#if $articles.length === page_size} -->
          <button on:click={nextPage}>&rarr;</button>
        <!-- {/if} -->
      </div>
    </div>
  {/if}
{:else}
  <div class="article-preview">Loading...</div>
{/if}

<script>
  import { stores } from "@sapper/app"
  import type User from "../../../store/User"
  import Article from "../../../store/Article"
  import ArticlePreview from "./ArticlePreview.svelte"

  export let tab: string, user: User|undefined = undefined
  export let favorites: boolean = false
  export let tag: string|null = null

  const { session } = stores()

  let pageSize = tab === "feed" ? 5 : 10

  export let articles = Article.query()
    .limit(pageSize).orderBy("createdAt", "desc")

  let cursor: {
    startAfter?: Article,
    endBefore?: Article
  } = {}

  $: {
    // const endpoint = tab === "feed" ? "articles/feed" : "articles"
    pageSize = tab === "feed" ? 5 : 10

    let query = Article.query()

    if (tab === "tag") query = query.where("tagList", "array-contains", tag)
    if (tab === "profile") query = query.where(favorites ? "favorited" : "author", "==", user?.docRef)
    if (cursor.endBefore) query = query.endBefore(cursor.endBefore).limitToLast(pageSize)
    else if (cursor.startAfter) query = query.startAfter(cursor.startAfter).limit(pageSize)
    else query = query.limit(pageSize)

    articles = query.orderBy("createdAt", "desc")
  }

  const nextPage = () => cursor = { startAfter: $articles.pop() }
  const prevPage = () => cursor = { endBefore: $articles.shift() }
</script>

<style>
  .pagination {
    @apply block text-center;

    button {
      @apply mx-4;
    }
  }
</style>
