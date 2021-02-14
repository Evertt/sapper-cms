<div class="outer" bind:this={mask} use:cssVars={{ width, height }} on:dblclick={toggleEdit}>
  <div class="mask">
    <div class="masked-image" bind:this={inner}>
      <img src={$data.src} alt={$data.alt} />
    </div>
  </div>
  <div class="full-image" bind:this={target} class:hidden={!edit || !editing}>
    <img src={$data.src} alt={$data.alt} />
  </div>
  {#if editing && edit}
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
</div>

<script>
  import type { Writable } from "svelte/store"
  import Moveable from "svelte-moveable"
  import cssVars from "svelte-css-vars"

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

  let innerBounds = {
    top: 0, left: 0,
    width: 0, height: 0,
  }

  let target: HTMLElement
  let inner: HTMLElement
  let mask: HTMLElement
  let edit = false

  const toggleEdit = () => {
    if (!editing) return
    edit = !edit
  }

  const onDragStart = (e: any) => e.set($data.translate)
  const onDrag = (e: any) => $data.translate = e.beforeTranslate

  const onRotateStart = (e: any) => e.set($data.rotate)
  const onRotate = (e: any) => $data.rotate = e.beforeRotate

  const onResizeStart = (e: any) => {
    e.setOrigin(["%", "%"])
    e.dragStart && e.dragStart.set($data.translate)
  }

  const onResize = (e: any) => {
    $data.translate = e.drag.beforeTranslate
    $data.width = e.width
    $data.height = e.height
  }

  $: if (inner && target && mask) {
    const translate = `translate(${$data.translate[0]}px, ${$data.translate[1]}px)`
    const scale = `scale(${$data.scale[0]}, ${$data.scale[1]})`
    const rotate = `rotate(${$data.rotate}deg)`

    target.style.transform = `${translate} ${scale} ${rotate}`
    inner.style.transform = `${translate} ${scale} ${rotate}`

    target.style.width = `${$data.width}px`
    target.style.height = `${$data.height}px`

    inner.style.width = `${$data.width}px`
    inner.style.height = `${$data.height}px`

    innerBounds = {
      top: mask.offsetTop,
      left: mask.offsetLeft,
      width: mask.offsetWidth,
      height: mask.offsetHeight,
    }
  }
</script>

<style>
  .outer {
    @apply relative inline-block bg-center overflow-visible;
    width: var(--width);
    height: var(--height);

    .mask {
      @apply w-full h-full overflow-hidden;
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

  .mask {
    clip-path: inset(0);
  }

  .full-image {
    @apply opacity-50;
  }
</style>