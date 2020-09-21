<script context="module">
	export function preload(this: any, {}, { user }: any) {
		if (!user) {
			this.redirect(302, `/login`);
		}
	}
</script>

<script>
	import { stores } from "@sapper/app"
	import Editor from "./_Editor.svelte"
	import Article from "../../store/Article"

	const { session } = stores()

	$: article = new Article({
		title: '',
		description: '',
		body: '',
		tagList: [],
		author: $session.user
	})
</script>

<Editor {article} />