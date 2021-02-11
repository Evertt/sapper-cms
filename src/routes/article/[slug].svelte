<script context="module">
  import Article from "../../store/Article"

  export async function preload(this: any, { params }: any) {
    const { slug } = params
    const article = Article.query().where("slug", "==", slug).first()

    try {
      const artcle = await article
      await artcle.author
      // const cmmnts = await artcle.comments

      // await Promise.all(cmmnts.map(
      //   async comment => await comment.author
      // ))

      return { article }
    } catch {
      this.error(404, "Article not found")
    }
  }
</script>

<svelte:head>
  <title>{($article || {}).title || "Loading..."}</title>
</svelte:head>

{#if $article}
<div class="article-page">

  <div class="banner">
    <div class="container">
      <h1>{$article.title}</h1>
      <ArticleMeta article={$article} user={$session.user}/>
    </div>
  </div>

  <div class="container page">
    <div class="row article-content">
      <div class="col-xs-12">
        <div>{@html markup}</div>

        <ul class="tag-list">
          {#each $article.tagList as tag}
            <li class="tag-default tag-pill tag-outline">
              {tag}
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <hr />

    <div class="article-actions"></div>

    <!-- <div class="row">
      {#if $comments}
        <CommentContainer article={$article} comments={$comments} user={$session.user} />
      {/if}
    </div> -->
  </div>
</div>
{/if}

<script>
  import { onDestroy } from "svelte"
  import { stores } from "@sapper/app"
  import marked from "marked"

  import ArticleMeta from "./_ArticleMeta.svelte"
  // import CommentContainer from "./_CommentContainer.svelte"

  const { session, page } = stores()
  const { slug } = $page.params

  // Just adding a default value in case
  // SSR wasn't working for some reason.
  export let article = Article.query()
    .where("slug", "==", slug).first()

  $: markup = marked($article.body)

  // let comments = $article.comments

  // $: {
  //   comments.unsubscribe()
  //   comments = $article.comments
  // }

  onDestroy(() => {
    // comments.unsubscribe()
    article.unsubscribe()
  })
</script>
