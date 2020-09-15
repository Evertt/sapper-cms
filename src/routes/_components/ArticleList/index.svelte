<script>
	import { stores } from '@sapper/app'
	import Article from "../../../store/Article"
	import ArticlePreview from './ArticlePreview.svelte'
	import ListPagination from './ListPagination.svelte'

	export let tab: string, username: string|false = false
	export let favorites: any[]|false = false
	export let tag: string|null = null
	// export let p: number

	const { session, page } = stores()

	let articles = Article.query().limit(1)
	const articlesCount = 40

	$: {
		// const endpoint = tab === 'feed' ? 'articles/feed' : 'articles'
		const page_size = tab === 'feed' ? 5 : 10

		let query = Article.query().limit(page_size)
		if (tab === "tag") query = articles.where("tagList", "array-contains", tag)
		if (tab === 'profile') query = articles.where(favorites ? "favorited" : "author", "==", username)
		articles = query.orderBy("createdAt", "desc")
	}
</script>

{#if $articles}
	{#if $articles.length === 0}
		<div class="article-preview">
			No articles are here... yet.
		</div>
	{:else}
		<div>
			{#each $articles as article (article.slug)}
				<ArticlePreview {article} user={$session.user}/>
			{/each}

			<ListPagination {articlesCount} page={parseInt($page.params.user, 10)}  />
		</div>
	{/if}
{:else}
	<div class="article-preview">Loading...</div>
{/if}