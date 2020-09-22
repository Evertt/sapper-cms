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

  export let articles = Article.query()
    .limit(10).orderBy("createdAt", "desc")

  $: {
    // const endpoint = tab === "feed" ? "articles/feed" : "articles"
    const page_size = tab === "feed" ? 5 : 10

    let query = Article.query().limit(page_size)
    if (tab === "tag") query = query.where("tagList", "array-contains", tag)
    if (tab === "profile") query = query.where(favorites ? "favorited" : "author", "==", user?.docRef)
    articles = query.orderBy("createdAt", "desc")
  }
</script>
