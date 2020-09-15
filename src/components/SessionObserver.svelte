<script>
  import { isEqual } from "lodash-es"
  import { stores } from "@sapper/app"
  import { throttle } from "../utils"
  import User from "../store/User"

  const { session } = stores()
  let lastSessionValue = { ...$session }

  const saveSession = (newSessionValue: any) => {
    const newSessionString = JSON.stringify(newSessionValue)
    const lastSessionString = JSON.stringify(lastSessionValue)

    if (newSessionString !== lastSessionString && !isEqual(newSessionValue, lastSessionValue)) {
      fetch("/session", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: newSessionString
      })

      lastSessionValue = newSessionValue
    }
  }

  const saveSessionThrottled = throttle(saveSession, 100, 500, 1000)

  $: if (process.browser) {
    if ($session.user && !$session.user.constructor) {
      $session.user = new User($session.user)
    }

    saveSessionThrottled({ ...$session })
  }
</script>