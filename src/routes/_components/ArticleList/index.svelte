<script context="module">
	export const preload = async () => {
		const articles = Article.query()
			.limit(10).orderBy("createdAt", "desc")

		await articles

		return { articles }
	}
</script>

<script>
	import { stores } from '@sapper/app'
	import Article from "../../../store/Article"
	import ArticlePreview from './ArticlePreview.svelte'
	import ListPagination from './ListPagination.svelte'

	export let tab: string, username: string|false = false
	export let favorites: boolean = false
	export let tag: string|null = null
	export let p: number
	if (p < 0) console.log("weird...")

	const { session, page } = stores()

	export let articles = Article.query().limit(10)
	const articlesCount = 40

	$: {
		// const endpoint = tab === 'feed' ? 'articles/feed' : 'articles'
		const page_size = tab === 'feed' ? 5 : 10

		let query = Article.query().limit(page_size)
		if (tab === "tag") query = query.where("tagList", "array-contains", tag)
		if (tab === 'profile') query = query.where(favorites ? "favorited" : "author", "==", username)
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
			{#each $articles as article (article.id)}
				<ArticlePreview {article} user={$session.user}/>
			{/each}

			<ListPagination {articlesCount} page={parseInt($page.params.user, 10)}  />
		</div>
	{/if}
{:else}
	<div class="article-preview">Loading...</div>
{/if}