<script context="module">
  import { preload as subPreload } from "./_components/Home.svelte"

  export async function preload({ params }: { params: any }) {
    const result = await subPreload()

    return {
      p: +params.p,
      ...result
    }
  }
</script>

<script>
  import Home from "./_components/Home.svelte"
  export let p: number
  export let articles: any
  export let misc: any
</script>

<Home {articles} {p} {misc} />
