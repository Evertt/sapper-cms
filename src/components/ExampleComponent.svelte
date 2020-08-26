<svelte:options immutable />

<h1>{title}</h1>
<p>{paragraph}</p>

<script>
  export let title: string
  export let paragraph: string
</script>

<style>
  h1 {
    @apply text-3xl text-blue-500 font-thin;
  }

  p {
    @apply mt-4 text-gray-700;
  }
</style>
