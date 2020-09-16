<script context="module">
	export function preload(this: any, {}, { user }: any) {
		if (!user) {
			this.redirect(302, `/login`);
		}
	}
</script>

<script>
	import Editor from "./_Editor.svelte"
	import Article from "../../store/Article"

	let article = new Article({ title: '', description: '', body: '', tagList: [] });
</script>

<Editor {article} />