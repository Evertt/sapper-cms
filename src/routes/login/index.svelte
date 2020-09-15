<script context="module">
  export async function preload(this: any, {}, { user }: any) {
    if (user) {
      this.redirect(302, `/`);
    }
  }
</script>

<svelte:head>
  <title>Sign in • Conduit</title>
</svelte:head>

<div class="auth-page">
  <div class="container page">
    <div class="row">
      <div class="col-md-6 offset-md-3 col-xs-12">
        <h1 class="text-xs-center">Sign In</h1>
        <p class="text-xs-center">
          <a href="/register">Need an account?</a>
        </p>

        <ListErrors {errors}/>

        <div bind:this={authContainer} />
      </div>
    </div>
  </div>
</div>

<script>
  import { goto } from "@sapper/app"
  import ListErrors from "../_components/ListErrors.svelte"
  import { fbClient } from "../../store/firebase"
  import type FirebaseUI from "firebaseui"

  let authContainer: Element
  let errors: any = null

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
          goto('/')
          return false
        },
        async signInFailure(error) {
          errors = error.toJSON()
        }
      }
    }

    ui.start(authContainer, uiConfig)
  }

  $: process.browser && authContainer && createLoginButtons()
</script>