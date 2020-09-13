<script>
  import { onMount } from "svelte"
  import { stores } from "@sapper/app"
  import { fbClient } from "../store/firebase"

  const { session } = stores()

  const watchFirebaseAuth = async () =>
    fbClient.auth().onIdTokenChanged(async (fbUser) => {
      if (!fbUser) {
        $session.user = null
        return
      }

      const idToken = await fbUser.getIdToken()

      $session.user = {
        name: fbUser.displayName,
        photo: fbUser.photoURL,
        email: fbUser.email,
        emailVerified: fbUser.emailVerified,
        idToken: idToken,
      }
    })

  onMount(watchFirebaseAuth)
</script>