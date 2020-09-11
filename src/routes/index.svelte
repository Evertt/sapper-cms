<div class="centerer">
  <a class="button" href="/graphql">Check out the GraphQL playground!</a>
  <a href="/blog">Check out the blog</a>
</div>

{#if $user}
  <button on:click={signOut}>Logout</button>
{:else}
  <div id="firebaseui-auth-container" />
{/if}

<script>
  import user from "../store/User"
  import { onMount, tick } from "svelte"
  import { fbClient } from "../store/firebase"
  import type FirebaseUI from "firebaseui"

  const createLoginButtons = async () => {
    const firebaseui = window.firebaseui

    const ui: FirebaseUI.auth.AuthUI =
      firebaseui.auth.AuthUI.getInstance()
      || new firebaseui.auth.AuthUI(fbClient.auth())

    const uiConfig: FirebaseUI.auth.Config = {
      signInOptions: [
        window.firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        signInSuccessWithAuthResult() {
          // User successfully signed in.
          // Return type determines whether we continue the redirect automatically
          // or whether we leave that to developer to handle.
          return false
        }
      }
    }

    ui.start("#firebaseui-auth-container", uiConfig)
  }

  const signOut = async () => {
    await fbClient.auth().signOut()
    await tick()
    createLoginButtons()
  }

  onMount(() => $user || createLoginButtons())
</script>

<style>
  div {
    @apply p-4 m-4;
  }

  .centerer {
    @apply flex-1 flex flex-col items-center justify-center;
  }

  .button {
    @apply mt-10 p-3 rounded-lg shadow-md text-pink-800 bg-pink-200 transition duration-200 ease-in-out hover:bg-pink-300 focus:bg-pink-300 focus:outline-none focus:shadow-outline;
  }
</style>
