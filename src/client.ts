import "./register-service-worker"
// eslint-disable-next-line import/no-unresolved
import * as sapper from "@sapper/app"

sapper.start({ target: document.getElementById("app") as Node })
sapper.prefetchRoutes(undefined as any)
