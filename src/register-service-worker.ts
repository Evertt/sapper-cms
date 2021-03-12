let refreshing: boolean

type SWInstalledEventListener = (registration: ServiceWorkerRegistration) => void

let swInstalledListener: SWInstalledEventListener = registration => {
  setTimeout(() => {
    // eslint-disable-next-line no-alert
    if (registration.waiting && window.confirm("New version available! OK to refresh?")) {
      registration.waiting.postMessage("skipWaiting")
    }
  }, 1000)
}

const respondToSWInstalled = (registration: ServiceWorkerRegistration) => () => {
  swInstalledListener(registration)
}

export const onSWInstalled = (listener: SWInstalledEventListener): void => {
  swInstalledListener = listener
}

function onNewServiceWorker(registration: ServiceWorkerRegistration, callback: () => void) {
  function listenInstalledStateChange() {
    registration.installing?.addEventListener("statechange", event => {
      if ((event.target as any)?.state === "installed") {
        callback()
      }
    })
  }

  if (registration.waiting) return callback()
  if (registration.installing) return listenInstalledStateChange()
  return registration.addEventListener("updatefound", listenInstalledStateChange)
}

if (process.browser) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(registration => onNewServiceWorker(
      registration, respondToSWInstalled(registration),
    ))

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })

  navigator.serviceWorker.addEventListener("message", event => {
    if (event.data === "refresh") window.location.reload()
  })
}
