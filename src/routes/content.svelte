<script context="module">
  import Misc from "../store/Misc"

	export const preload = async () => {
    const misc = await Misc.find("misc")

    return { misc }
  }
</script>

<svelte:head>
  <title>Content</title>
</svelte:head>

<div class="home-page">
  <div class="banner">
    <div class="container">
      <h1 class="logo-font">conduit</h1>
      <p>A place to share your knowledge.</p>
    </div>
  </div>

  <div class="container page">
    <div class="row">
      <h1>Hello there!</h1>
    </div>
  </div>
</div>

<script>
  
</script>
