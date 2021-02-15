<script context="module">
  import User from "../../../store/User"

  export async function preload(this: any, { params }: any) {
    const username = params.user.slice(1)
    const profile = User.query().where("username", "==", username).first()

    await profile

    return { profile }
  }
</script>

<svelte:head>
  <title>{$profile.username} • Conduit</title>
</svelte:head>

<Profile profile={$profile} user={$session.user} />

<script>
  import type { Observable } from "rxjs"
  import { stores } from "@sapper/app"
  import Profile from "./_Profile.svelte"

  export let profile: Observable<User>

  const { session } = stores()
</script>
