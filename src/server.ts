import fs from "fs"
import path from "path"
import mime from "mime/lite"
import * as sapper from "@sapper/server" // eslint-disable-line import/no-unresolved
import express, { Express } from "express"
import sirv from "sirv"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import session from "express-session"
import firestoreSessionStore from "firestore-store"
import csrf from "csurf"
import shrinkRay from "shrink-ray-current"
import { fbAdmin, db } from "./store"
import User from "./store/User"

const PORT = process.env.PORT // eslint-disable-line prefer-destructuring
const mode = process.env.NODE_ENV
const dev = mode === "development"

const main = require.main === module || require.main?.filename.match(/__sapper__\/build\/index.js$/)

const FirestoreStore = firestoreSessionStore(session)

export const createSapperServer = async (): Promise<Express> => {
  const eTaggedAssets: Record<string, Record<string, string>> = {}

  const app = express()

  if (main) {
    app.use(sirv("static", { dev, etag: true }))
  }

  app.use(
    async (req, res, next) => {
      const match = req.url.match(/\/client\/(.+\.(css|js))$/)
      if (!match) return next()
      const filename = match[1]

      if (!(filename in eTaggedAssets)) {
        const dir = dev ? "__sapper__/dev" : "__sapper__/build"
        const stats = fs.statSync(path.resolve(`${dir}/client/${filename}`))
        eTaggedAssets[filename] = {
          "Content-Length": stats.size as any,
          "Content-Type": (mime as any).getType(filename) || "",
          "Last-Modified": stats.mtime.toUTCString(),
          ETag: `W/"${stats.size}-${stats.mtime.getTime()}"`,
        }
      }

      if (req.headers["if-none-match"] === eTaggedAssets[filename].ETag) {
        res.writeHead(304)
        return res.end()
      }

      // eslint-disable-next-line guard-for-in
      for (const key in eTaggedAssets[filename]) {
        res.setHeader(key, eTaggedAssets[filename][key])
      }

      return next()
    },
    shrinkRay(),
    session({
      store: new FirestoreStore({ database: db }),
      secret: "I should probably have a secret that's not saved in the repo...",
      saveUninitialized: false,
      name: "__session",
      rolling: true,
      resave: false,
      proxy: true,
      cookie: {
        secure: !dev,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30 * 6,
      },
    }),
    cookieParser(),
    csrf(),
    bodyParser.json(),
    async (req, {}, next) => {
      // eslint-disable-next-line no-shadow
      const session = req.session as any

      try {
        // eslint-disable-next-line no-underscore-dangle
        const sessionCookie = session.firebaseSessionCookie
        if (!sessionCookie) return next()

        const decodedClaims = await fbAdmin.auth()
          .verifySessionCookie(sessionCookie, true)

        const user = await User.find(decodedClaims.uid)
        session.user_id = user.id
        session.public = {
          ...session.public,
          user: user.toJSON(),
        }
      } catch {
        delete session.firebaseSessionCookie
        delete session.user_id
      }

      return next()
    },
    sapper.middleware({
      session: (req: any) => ({
        ...req.session.public,
        csrfToken: req.csrfToken(),
      }),
    }),
  )

  return app
}

if (main) {
  createSapperServer().then(app => {
		app.listen(PORT, (err?: any): void => { // eslint-disable-line
      if (err) console.log("error", err)
    })
  })
}

// For more Cloud Functions, write and export them here
// and import and set them up in `/index.js`
