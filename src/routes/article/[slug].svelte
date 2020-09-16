<script context="module">
	import Article from "../../store/Article"

	export async function preload(this: any, { params }: any) {
		const { slug } = params;
		const article = Article.query().where("slug", "==", slug).first()

		return new Promise(resolve => {
			article.subscribe($article => {
				if ($article === undefined) return
				if ($article === null) return this.error(404, "Article not found")
				resolve({ article })
			})
		})
	}
</script>

<script>
	import { stores } from '@sapper/app';
	import marked from 'marked';

	import ArticleMeta from './_ArticleMeta.svelte';
	import CommentContainer from './_CommentContainer.svelte';
	import type { Readable } from "svelte/store";

	export let article = undefined as unknown as Readable<Article>
	const comments = $article.comments

	const { session } = stores()

	$: markup = marked($article.body)
</script>

<svelte:head>
	<title>{$article.title}</title>
</svelte:head>

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

		<div class="row">
			{#if $comments}
				<CommentContainer article={$article} comments={$comments} user={$session.user} />
			{/if}
		</div>
	</div>
</div>