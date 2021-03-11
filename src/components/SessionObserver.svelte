<script>
  import { isEqual } from "lodash-es"
  import { stores } from "@sapper/app"
  import { throttle } from "../utils"
  import User from "../store/User"

  const jsonify = (obj: any, depth = 0): any => {
    obj = { ...obj }
    Object.keys(obj).forEach(key => {
      if (obj[key] === null) return
      if (typeof obj[key] !== "object") return
      if (typeof obj[key].toJSON === "function") {
        obj[key] = obj[key].toJSON()
      } else if (depth < 8) {
        obj[key] = jsonify(obj[key], depth + 1)
      }
    })

    return obj
  }

  const { session } = stores()

  if (process.browser && $session.user && $session.user.constructor?.name !== "User") {
    $session.user = new User($session.user)
  }

  let lastSessionValue = jsonify($session)

  const saveSession = (newSessionValue: any) => {
    newSessionValue = jsonify(newSessionValue)
    
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
    saveSessionThrottled($session)
  }

  if (process.browser && "serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", event => {
      if (!event.data.match(/^__SAPPER/)) return
      eval(event.data)
      $session = (window as any).__SAPPER__.session
      if (process.env.NODE_ENV === "development") {
        console.log("refreshed session from sw")
      }
    })
  }
</script>
