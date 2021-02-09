import * as sapper from "@sapper/server" // eslint-disable-line import/no-unresolved
import compression from "compression"
import express, { Express } from "express"
import sirv from "sirv"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import session from "express-session"
import firestoreSessionStore from "firestore-store"
import csrf from "csurf"
import { fbAdmin, db } from "./store"
import User from "./store/User"

const PORT = process.env.PORT // eslint-disable-line prefer-destructuring
const mode = process.env.NODE_ENV
const dev = mode === "development"

const main = require.main === module || require.main?.filename.match(/__sapper__\/build\/index.js$/)

const FirestoreStore = firestoreSessionStore(session)

export const createSapperServer = async (): Promise<Express> => {
  const app = express()

  if (main) {
    app.use(sirv("static", { dev }))
  }

  app.use(
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
    compression({ threshold: 0 }),
    cookieParser(),
    csrf(),
    bodyParser.json(),
    async (req, {}, next) => {
      try {
        // eslint-disable-next-line no-underscore-dangle
        const sessionCookie = req.session!.firebaseSessionCookie
        if (!sessionCookie) return next()

        const decodedClaims = await fbAdmin.auth()
          .verifySessionCookie(sessionCookie, true)

        const user = await User.find(decodedClaims.uid)
        req.session!.user_id = user.id
        req.session!.public = {
          ...req.session!.public,
          user: user.toJSON(),
        }
      } catch {
        delete req.session!.firebaseSessionCookie
        delete req.session!.user_id
      }

      return next()
    },
    sapper.middleware({
      session: (req: any) => ({
        ...req.session!.public,
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
