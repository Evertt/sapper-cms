/* eslint-disable no-underscore-dangle */
function showRefreshUI(registration: any) {
  // TODO: Display a toast or refresh UI.

  // This demo creates and injects a button.

  const button = document.createElement("button")
  button.style.position = "absolute"
  button.style.bottom = "24px"
  button.style.left = "24px"
  button.textContent = "This site has updated. Please click here to see changes."

  button.addEventListener("click", () => {
    if (!registration.waiting) {
      // Just to ensure registration.waiting is available before
      // calling postMessage()
      return
    }

    button.disabled = true

    registration.waiting.postMessage("skipWaiting")
  })

  document.body.appendChild(button)
}

function onNewServiceWorker(registration: ServiceWorkerRegistration, callback: () => void) {
  if (registration.waiting) {
    // SW is waiting to activate. Can occur if multiple clients open and
    // one of the clients is refreshed.
    return callback()
  }

  function listenInstalledStateChange() {
    registration.installing?.addEventListener("statechange", event => {
      if ((event.target as any)?.state === "installed") {
        // A new service worker is available, inform the user
        callback()
      }
    })
  }

  if (registration.installing) {
    return listenInstalledStateChange()
  }

  // We are currently controlled so a new SW may be found...
  // Add a listener in case a new SW is found,
  return registration.addEventListener("updatefound", listenInstalledStateChange)
}

if ("serviceWorker" in navigator /* && "SyncManager" in window */) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(registration => {
      // Track updates to the Service Worker.
      if (!navigator.serviceWorker.controller) {
        // The window client isn"t currently controlled so it"s a new service
        // worker that will activate immediately
        console.log("No controller at the moment")
        return
      }

      // When the user asks to refresh the UI, we"ll need to reload the window
      navigator.serviceWorker.addEventListener("controllerchange", function controllerchange() {
        const t = this as any as { __allowControllerReload: boolean }
        // Ensure refresh is only called once.
        // This works around a bug in "force update on reload".
        console.log(`this.__allowControllerReload: ${t.__allowControllerReload}`)
        if (t.__allowControllerReload) {
          console.log("New controller, but not refreshing.")
          return
        }

        console.log("New controller found, reloading window")
        t.__allowControllerReload = true
        window.location.reload()
      })

      onNewServiceWorker(
        registration,
        () => showRefreshUI(registration),
      )
    })

  navigator.serviceWorker.addEventListener("message", event => {
    if (event.data === "refresh") window.location.reload()
  })
}

export {}
