<script>
  import { isEqual } from "lodash-es"
  import { stores } from "@sapper/app"
  import { throttle } from "../utils"

  const { session } = stores()
  let lastSessionValue = { ...$session }

  const saveSession = (newSessionValue: any) => {
    if (!isEqual(newSessionValue, lastSessionValue)) {
      fetch("/session", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify($session)
      })

      lastSessionValue = { ...newSessionValue }
    }
  }

  const saveSessionThrottled = throttle(saveSession, 100, 500, 1000)

  $: if (process.browser) {
    saveSessionThrottled($session)
  }
</script>