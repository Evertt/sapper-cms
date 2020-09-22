<script context="module">
  export function preload(this: any, {}, { user }: any) {
    if (!user) {
      this.redirect(302, `/login`)
    }
  }
</script>

<svelte:head>
  <title>Settings • Conduit</title>
</svelte:head>

<div class="settings-page">
  <div class="container page">
    <div class="row">
      <div class="col-md-6 offset-md-3 col-xs-12">

        <h1 class="text-xs-center">Your Settings</h1>

        <SettingsForm on:save={save} {...$session.user} {inProgress}/>

        <hr />

        <button class="btn btn-outline-danger" on:click={logout}>
          Or click here to logout.
        </button>
      </div>
    </div>
  </div>
</div>

<script>
  import { goto, stores } from "@sapper/app"
  import ListErrors from "../_components/ListErrors.svelte"
  import SettingsForm from "./_SettingsForm.svelte"
  import { post } from "utils.js"
  import { fbClient } from "../../store/firebase"

  let inProgress: boolean

  const { session } = stores()

  async function logout() {
    await fbClient.auth().signOut()
    goto("/")
  }

  async function save({ detail }: any) {
    inProgress = true

    const user = $session.user
    Object.assign(user, detail)
    await user.save("update")
    $session.user = user

    inProgress = false
  }
</script>
