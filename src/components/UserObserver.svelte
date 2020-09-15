<script>
  import { onMount } from "svelte"
  import { stores } from "@sapper/app"
  import User from "../store/User"
  import { fbClient } from "../store/firebase"

  const { session } = stores()

  const watchFirebaseAuth = async () =>
    fbClient.auth().onIdTokenChanged(async (fbUser) => {
      if (!fbUser) {
        $session.user = null
        return
      }

      const idToken = await fbUser.getIdToken()
      const user = new User({
        id: fbUser.uid,
        token: idToken,
        name: fbUser.displayName,
        image: fbUser.photoURL,
        email: fbUser.email,
        emailVerified: fbUser.emailVerified,
        username: (fbUser.displayName?.match(/^\w+/) || [])[0]
      })

      await user.updateOrCreate()
      $session.user = user
    })

  onMount(watchFirebaseAuth)
</script>