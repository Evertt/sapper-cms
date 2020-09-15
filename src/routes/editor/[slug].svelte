<script context="module">
	import Article from '../../store/Article';

	export async function preload(this: any, { params }: any, { user }: any) {
		if (!user) {
			this.redirect(302, `/login`)
		}

		const article = Article.query()
			.where("slug", "==", params.slug).first()

		return { article }
	}
</script>

<script>
	import type { Readable } from 'svelte/store';
	import Editor from './_Editor.svelte';

	export let article: Readable<Article>
</script>

<Editor article={$article} />