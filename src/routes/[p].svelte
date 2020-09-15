<script context="module">
  export function preload({ params }: { params: any }) {
    return {
      p: +params.p
    }
  }
</script>

<script>
  import Home from "./_components/Home.svelte"
  export let p: number
</script>

<Home {p} />