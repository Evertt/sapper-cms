<script context="module">
	import { preload } from "./_components/Home.svelte"

	export { preload }
</script>

<Home {articles} p={1} {misc} />

<script>
  import Home from "./_components/Home.svelte"

  export let articles: any
  export let misc: any
</script>