<svelte:head>
  <title>{status}</title>
</svelte:head>

<section>
  <h1>{error.message}</h1>
  <h2>{status}</h2>
</section>

{#if dev && error.stack}
  <pre>{error.stack}</pre>
{/if}

<script>
  export let status: number
  export let error: Error

  const mode = process.env.NODE_ENV
  const dev = mode === "development"
</script>

<style>
  section {
    @apply flex flex-1 flex-col items-center justify-center;
  }

  h1 {
    @apply text-red-700 text-2xl;
  }

  h2 {
    @apply mt-1 text-red-700 text-lg;
  }
</style>