<script>
  import user from "../store/User"
  import Cookies from "js-cookie"
  import { onMount } from "svelte"
  import { stores } from "@sapper/app"
  import { fbClient } from "../store/firebase"

  const { session } = stores()
  $user = $session.user

  onMount(async () => {
    fbClient.auth().onIdTokenChanged(async (fbUser) => {
      if (!fbUser) {
        Cookies.remove('token')
        $user = null
        return
      }

      const token = await fbUser.getIdToken()
      Cookies.set('token', token)
      
      $user = {
        name: fbUser.displayName,
        photo: fbUser.photoURL,
        email: fbUser.email,
        emailVerified: fbUser.emailVerified,
      }
    });
  });
</script>