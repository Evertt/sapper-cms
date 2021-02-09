{#if tags}
  <div class="tag-list">
    {#each tags as tag}
      <a href="." class="tag-default tag-pill" on:click={_ => dispatch("select", { tag })}>
        {tag}
      </a>
    {/each}
  </div>
{:else}
  <div>Loading Tags...</div>
{/if}

<script>
  import { createEventDispatcher } from "svelte"

  export let tags: string[]|undefined
  const dispatch = createEventDispatcher()
</script>
