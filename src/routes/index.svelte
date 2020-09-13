<div class="centerer">
  {#if $session.user}
    <h2>Welcome {$session.user.name}!</h2>
    <button on:click={signOut}>Logout</button>
  {:else}
    <div bind:this={authContainer} />
  {/if}
  <br />
  <a href="/blog">Check out the blog</a>
</div>

<script>
  import { stores } from "@sapper/app"
  import { fbClient } from "../store/firebase"
  import type FirebaseUI from "firebaseui"

  let authContainer: Element
  const { session } = stores()

  const createLoginButtons = async () => {
    const firebaseui = window.firebaseui

    const ui: FirebaseUI.auth.AuthUI =
      firebaseui.auth.AuthUI.getInstance()
      || new firebaseui.auth.AuthUI(fbClient.auth())

    const uiConfig: FirebaseUI.auth.Config = {
      signInOptions: [
        window.firebase.auth.EmailAuthProvider.PROVIDER_ID,
        window.firebase.auth.GoogleAuthProvider.PROVIDER_ID,
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

    ui.start(authContainer, uiConfig)
  }

  const signOut = () => fbClient.auth().signOut()

  $: process.browser && authContainer && createLoginButtons()
</script>

<style>
  div {
    @apply p-4 m-4;
  }

  .centerer {
    @apply flex-1 flex flex-col items-center justify-center;
  }
</style>
