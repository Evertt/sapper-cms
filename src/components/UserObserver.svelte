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
      let user: User

      try {
        user = await User.find(fbUser.uid)
        user.token = idToken
        await user.save("update")
      } catch {
        user = new User({
          id: fbUser.uid,
          token: idToken,
          displayName: fbUser.displayName || "",
          image: fbUser.photoURL || "",
          email: fbUser.email || "",
          emailVerified: fbUser.emailVerified || false,
          username: (fbUser.displayName?.match(/^\w+/) || [])[0]
        })

        await user.save()
      }

      $session.user = user
    })

  onMount(watchFirebaseAuth)
</script>