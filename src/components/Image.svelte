<div class="outer" bind:this={mask} use:cssVars={{ width, height }}>
  <div class="mask">
    <div class="masked-image" bind:this={inner}>
      <img src={$data.src} alt={$data.alt} />
    </div>
  </div>
  <div class="full-image" bind:this={target} class:hidden={!transforming}>
    <img src={$data.src} alt={$data.alt} />
  </div>
  {#if transforming}
    <Moveable
      {target}
      origin={false}

      draggable={true}
      resizable={true}
      rotatable={true}
      pinchable={true}

      snappable={true}
      keepRatio={true}
      renderDirections={["nw", "ne", "sw", "se"]}
      {innerBounds}

      {onRotateStart}
      {onRotate}
      {onDragStart}
      {onDrag}
      {onResizeStart}
      {onResize}
    />
  {/if}
  {#if editing}
    <button on:click={_ => transforming = !transforming}>
      { transforming ? "Preview" : "Transform" }
    </button>

    <button on:click={_ => open(Modal)}>Replace</button>
  {/if}
</div>

<script>
  import type { Writable } from "svelte/store"
  import Modal from "../components/Modal.svelte"
  import Moveable from "svelte-moveable"
  import cssVars from "svelte-css-vars"
  import { getContext } from "svelte"

  const { open } = getContext("simple-modal")

  const emptyData = {
    width: "auto",
    height: "auto",
    translate: [0,0],
    scale: [1,1],
    rotate: 0,
    src: "https://img-fotki.yandex.ru/get/5607/5091629.6b/0_612e6_b9039c0d_M.jpg",
    alt: ""
  }

  export let width = "100%"
  export let height = "100%"
  export let editing = false
  export let data: Writable<typeof emptyData>
  $: $data = $data || emptyData

  $: if (!editing) {
    transforming = false
  }

  let innerBounds = {
    top: 0, left: 0,
    width: 0, height: 0,
  }

  let target: HTMLElement
  let inner: HTMLElement
  let mask: HTMLElement
  let transforming = false

  const onDragStart = (e: any) => e.set($data.translate)
  const onDrag = (e: any) => $data.translate = e.beforeTranslate

  const onRotateStart = (e: any) => e.set($data.rotate)
  const onRotate = (e: any) => $data.rotate = e.beforeRotate

  const onResizeStart = (e: any) => {
    e.setOrigin(["%", "%"])
    e.dragStart && e.dragStart.set($data.translate)
  }

  const onResize = (e: any) => $data = {
    ...$data,
    translate: e.drag.beforeTranslate,
    width: e.width,
    height: e.height,
  }

  $: if (inner && target && mask) {
    const translate = `translate(${$data.translate[0]}px, ${$data.translate[1]}px)`
    const scale = `scale(${$data.scale[0]}, ${$data.scale[1]})`
    const rotate = `rotate(${$data.rotate}deg)`
    const t = target, i = inner

    t.style.transform = `${translate} ${scale} ${rotate}`
    i.style.transform = `${translate} ${scale} ${rotate}`

    t.style.width = `${$data.width}px`
    t.style.height = `${$data.height}px`

    i.style.width = `${$data.width}px`
    i.style.height = `${$data.height}px`
  }

  $: innerBounds = {
    top: mask?.offsetTop,
    left: mask?.offsetLeft,
    width: mask?.offsetWidth,
    height: mask?.offsetHeight,
  }
</script>

<style>
  .outer {
    @apply relative overflow-visible;
    @apply flex items-center justify-center flex-col;

    width: var(--width);
    height: var(--height);

    button {
      @apply p-2 m-2 bg-gray-400 rounded hidden z-10;
    }

    &:hover button {
      @apply inline-block;
    }

    .mask {
      @apply absolute w-full h-full overflow-hidden;

      clip-path: inset(0);

      .masked-image {
        z-index: -1;
      }
    }
    
    .masked-image, .full-image {
      @apply absolute left-0 top-0 min-w-full min-h-full;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }

  .full-image {
    @apply opacity-50;
  }
</style>