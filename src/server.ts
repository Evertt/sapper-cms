import * as sapper from "@sapper/server" // eslint-disable-line import/no-unresolved
import compression from "compression"
import express, { Express } from "express"
import sirv from "sirv"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import session from "express-session"
import firestoreSessionStore from "firestore-store"
import csrf from "csurf"
import { fbAdmin, db } from "./store/firebase"

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
      resave: false,
      cookie: {
        secure: !dev,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      },
    }),
    compression({ threshold: 0 }),
    cookieParser(),
    csrf(),
    bodyParser.json(),
    async (req, res, next) => {
      try {
        // eslint-disable-next-line no-underscore-dangle
        const sessionCookie = req.session!.firebaseSessionCookie
        if (!sessionCookie) return next()
        const decodedClaims = await fbAdmin.auth().verifySessionCookie(sessionCookie, true)
        req.session!.public = {
          ...req.session!.public,
          user: {
            name: decodedClaims.name,
            photo: decodedClaims.picture,
            email: decodedClaims.email,
            emailVerified: decodedClaims.email_verified,
            idToken: req.session!.firebaseIdToken,
          },
        }
      } catch {
        delete req.session!.firebaseSessionCookie
      }

      return next()
    },
    sapper.middleware({
      session: (req: Express.Request) => ({
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
