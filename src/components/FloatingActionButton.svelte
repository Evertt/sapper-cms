<button on:click bind:this={button} class:notext={!text}>
  <span style="--opacity: {$opacity}; --transform-rotate: {$angle}deg">
    <Fa icon={shownIcon} size="lg" />
  </span>
  <span>{text}</span>
</button>

<script>
  import Fa from "svelte-fa"
  import { faEdit } from "@fortawesome/free-solid-svg-icons"
  import { tweened } from "svelte/motion"
  import { linear, cubicOut } from "svelte/easing"
  import { throttle } from "lodash-es"
  import { sleep } from "../utils"

  export let loading = false
  export let icon = faEdit
  let button: HTMLElement
  let initialized = false
  let shownIcon = icon
  let text: string = "hello there..."

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
  button {
    /* @apply text-white px-4 w-auto h-10 bg-red-600 rounded-full cursor-pointer transition ease-in duration-200 shadow-md-dark; */
    @apply m-4 p-0 h-12
    bg-red-600 rounded-full
    cursor-pointer transition
    ease-in duration-200 text-white shadow-md-dark;
    --bg-opacity: 0.85;
    min-width: 3rem;

    &:hover {
      @apply shadow-lg-dark;
      --bg-opacity: 0.95;
    }

    &:active {
      @apply shadow-dark bg-opacity-100;
    }

    &:focus {
      @apply outline-none;
    }

    span:first-child {
      @apply w-6 h-6 inline-block mr-1 pt-2 transform;
      opacity: var(--opacity);
      line-height: 3rem;
    }

    span:last-child {
      @apply inline-block h-10 leading-10 align-middle;
    }
  }

  button.notext {
    span:last-child {
      @apply hidden;
    }
  }
</style>