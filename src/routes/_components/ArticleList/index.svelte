<script context="module">
  const now = new Date()

  export const preload = async () => {
    const articles = Article.query()
      .where("createdAt", "<", now)
      .orderBy("createdAt", "desc")
      .limit(10)

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

      <button on:click={generateUsers}>Generate users!</button>
      <button on:click={generateArticles}>Generate articles!</button>
    </div>
  {:else}
    <div class="list">
      {#each $articles as article (article.id)}
        <ArticlePreview {article} user={$session.user} />
      {/each}

      <div class="pagination">
        {#if !isFirstPage}
          <button on:click={prevPage}>&larr;</button>
        {/if}

        {#if !isLastPage}
          <button on:click={nextPage}>&rarr;</button>
        {/if}

        {#if loading}
          <div class="cover"
            in:fade={{ duration: 250 }}
            out:fade={{ duration: 250, delay: 250 }} />
        {/if}
      </div>
    </div>
  {/if}
{:else}
  <div class="article-preview">Loading...</div>
{/if}

<script>
  import faker from "faker"
  import { onDestroy } from "svelte"
  import { stores } from "@sapper/app"
  import { sleep } from "../../../utils"
  import User from "../../../store/User"
  import { fade } from "svelte/transition"
  import Article from "../../../store/Article"
  import { scrollToTop } from "svelte-scrollto"
  import ArticlePreview from "./ArticlePreview.svelte"

  export let user: User|undefined = undefined
  export let favorites: boolean = false
  export let tag: string|null = null
  export let tab: string

  const { session } = stores()

  let pageSize = tab === "feed" ? 5 : 10

  export let articles = Article.query()
    .where("createdAt", "<", now)
    .orderBy("createdAt", "desc")
    .limit(pageSize)

  let cursor: {
    startAfter?: Date,
    endBefore?: Date
  } = {}

  let page = 1
  $: isFirstPage = page === 1
  $: isLastPage = $articles.length < pageSize

  let loading = false
  $: if ($articles.length) loading = false

  const startLoadingAnimation = async () => {
    loading = true
    await sleep(150)
    if (process.browser) scrollToTop({ duration: 250 })
    await sleep(250)
  }

  const unsubscribe = () => {
    $articles?.forEach(article =>
      article.author.unsubscribe()
    )
    articles?.unsubscribe()
  }

  onDestroy(unsubscribe)

  $: {
    // const endpoint = tab === "feed" ? "articles/feed" : "articles"
    pageSize = tab === "feed" ? 5 : 10

    let newQuery = Article.query()
      .where("createdAt", "<", now)
      .orderBy("createdAt", "desc")

    if (tab === "tag") newQuery = newQuery.where("tagList", "array-contains", tag)
    if (tab === "profile") newQuery = newQuery.where(favorites ? "favorited" : "author", "==", user?.docRef)
    if (cursor.endBefore) newQuery = newQuery.endBefore(cursor.endBefore).limitToLast(pageSize)
    else if (cursor.startAfter) newQuery = newQuery.startAfter(cursor.startAfter).limit(pageSize)
    else newQuery = newQuery.limit(pageSize)

    unsubscribe()
    articles = newQuery
  }

  const nextPage = async () => {
    await startLoadingAnimation()
    cursor = { startAfter: $articles.pop()!.createdAt }
    page++
  }

  const prevPage = async () => {
    await startLoadingAnimation()
    cursor = { endBefore: $articles.shift()!.createdAt }
    page--
  }

  const generateUsers = async () => {
    for (let i = 0; i < 50; i++) {
      console.count("user")

      const user = new User({
        email: faker.internet.email(),
        displayName: faker.name.firstName(),
        username: faker.internet.userName(),
        image: faker.image.avatar(),
        bio: faker.lorem.paragraphs(),
        emailVerified: faker.random.number(10) <= 2,
        following: faker.random.number(10) <= 2,
        token: faker.random.alphaNumeric(20),
      })

      await user.save()
    }
  }

  const generateArticles = async () => {
    const users = await User.query()

    for (let i = 0; i < 50; i++) {
      console.count("article")
      const title = faker.lorem.sentence()
      const slug = faker.helpers.slugify(title)

      const article = new Article({
        author: faker.random.arrayElement(users) as any,
        title, slug,
        body: faker.lorem.text(),
        tagList: faker.lorem.words(3).split(" "),
        description: faker.lorem.sentence(),
        favorited: faker.random.boolean(),
        favoritesCount: faker.random.number(10)
      })

      await article.save()
    }
  }
</script>

<style>
  .list {
    @apply relative;
  }

  .pagination {
    @apply block text-center;

    button {
      @apply mx-4;
    }
  }

  .cover {
    @apply absolute top-0 left-0 w-full h-full bg-white;
    /* background: white url(/loading.gif) no-repeat top center; */
  }
</style>
