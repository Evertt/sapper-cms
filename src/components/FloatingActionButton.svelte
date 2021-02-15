<div on:mouseenter={_ => showCommitButton = true} on:mouseleave={_ => showCommitButton = false}>
  {#if canCommit && showCommitButton && shownIcon !== faEdit}
    <button class="absolute" style="top: -3.5rem;" transition:fade={{ duration: 250 }}
      on:mouseenter={_ => moveTextUp = true} on:mouseleave={_ => moveTextUp = false}
      on:click={_ => dispatch('commit')}
    >
      <span><Fa icon={faCheck} size="lg" /></span>
    </button>
  {/if}

  <button bind:this={button} on:click on:mouseenter on:mouseleave>
    <span style="--opacity: {$opacity}; --transform-rotate: {$angle}deg">
      <Fa icon={shownIcon} size="lg" />
    </span>
  </button>
  
  {#if text}
    <span transition:fade={{ duration: 250 }} class:moveup={moveTextUp && shownIcon !== faEdit}>
      {moveTextUp && shownIcon !== faEdit ? "click to publish" : text}
    </span>
  {/if}
</div>

<script>
  import Fa from "svelte-fa"
  import { fade } from "svelte/transition"
  import { faEdit, faCheck } from "@fortawesome/free-solid-svg-icons"
  import { tweened } from "svelte/motion"
  import { linear, cubicOut } from "svelte/easing"
  import { throttle } from "lodash-es"
  import { sleep } from "../utils"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  export let loading = false
  export let icon = faEdit
  export let text = ""
  export let canCommit = false
  let moveTextUp = false
  let showCommitButton = false
  let button: HTMLElement
  let initialized = false
  let shownIcon = icon

  const angle = tweened(0, {
    duration: 500,
		easing: cubicOut
  })

  const opacity = tweened(1, {
    duration: 250,
		easing: linear
  })

  const spinOnce = () => {
    angle.set($angle % 360, { duration: 0 })
    $angle = 360
  }

  const duration = 1000
  const loop = throttle(start => {
    start = start % 360
    angle.set(start, { duration: 0 })
    angle.set(start + 360, { duration, easing: linear })
    loop(start)
  }, duration)

  const startSpinning = () => loop($angle)
  const stopSpinning = () => {
    loop.cancel()
    angle.set($angle, { duration: 0 })
  }

  $: if (!initialized) {
    initialized = true
  } else if (shownIcon !== icon) {
    stopSpinning()

    if (loading) {
      startSpinning()
    } else {
      spinOnce()
    }
    opacity.set(0, {
      duration: 200,
      easing: linear
    })
    sleep(250).then(() => {
      shownIcon = icon
      opacity.set(1, {
        duration: 300,
        easing: cubicOut
      })
    })
  } else if (loading) {
    startSpinning()
  } else {
    stopSpinning()
    spinOnce()
  }
</script>

<style>
  div {
    @apply fixed left-0 bottom-0 ml-8 mb-8
      flex items-center;
    --bg-opacity: 0.85;

    button {
      @apply p-0 w-12 h-12
      bg-red-600 rounded-full
      cursor-pointer transition
      ease-in duration-200 text-white shadow-md-dark;
      min-width: 3rem;
      --bg-opacity: 0.85;

      &:hover {
        @apply shadow-lg-dark;
        --bg-opacity: 0.95;

        & + span {
          --bg-opacity: 0.95;
        }
      }

      &:active {
        @apply shadow-dark bg-opacity-100;

        & + span {
          @apply bg-opacity-100;
        }
      }

      &:focus {
        @apply outline-none;
      }

      span {
        @apply flex transform;
        opacity: var(--opacity);
        line-height: 3rem;

        :global(svg) {
          @apply w-12;
        }
      }

      & + span {
        @apply ml-2 py-2 px-3 rounded shadow cursor-default transition-all ease-in duration-200;
        background-color: white;
        --bg-opacity: 0.85;
        opacity: var(--bg-opacity);

        &.moveup {
          margin-top: -7rem;
        }
      }
    }
  }
</style>