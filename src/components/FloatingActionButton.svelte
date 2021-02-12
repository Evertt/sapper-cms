<button class="shadow active:shadow-lg" on:click={spin}>
  <span><Fa {icon} rotate={$angle} size="lg" /></span>
</button>

<script>
  import Fa from "svelte-fa"
  import { faEdit } from "@fortawesome/free-solid-svg-icons"
  import { tweened } from "svelte/motion"
  import { linear, cubicOut } from "svelte/easing"
  import { throttle } from "lodash-es"

  let spinning = false
  export let loading = false
  export let icon = faEdit

  const angle = tweened(0, {
    duration: 500,
		easing: cubicOut
  })

  const spinOnce = () => {
    if ($angle % 360 === 0) return
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

  const spin = () => {
    spinning = !spinning
    if (spinning) {
      startSpinning()
    } else {
      stopSpinning()
    }
  }

  const startSpinning = () => loop($angle)
  const stopSpinning = () => {
    loop.cancel()
    angle.set($angle, { duration: 0 })
  }

  $: if (loading) {
    startSpinning()
  } else {
    stopSpinning()
    spinOnce()
  }
</script>

<style>
  button {
    @apply m-4 p-0 w-12 h-12
    bg-red-600 rounded-full
    cursor-pointer transition
    ease-in duration-200 text-white;

    &:hover {
      @apply bg-red-700;
    }

    &:focus {
      @apply outline-none;
    }

    span {
      @apply flex justify-items-center content-center;

      :global(svg) {
        width: 100%;
      }
    }
  }
</style>