import * as sapper from "@sapper/server" // eslint-disable-line import/no-unresolved
import compression from "compression"
import express, { Express } from "express"
import sirv from "sirv"
import { get } from "svelte/store"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import user from "./store/User"
import { fbAdmin } from "./store/firebase"
import { createApolloServer } from "./graphql"

const PORT = process.env.PORT // eslint-disable-line prefer-destructuring
const mode = process.env.NODE_ENV
const dev = mode === "development"

const main = require.main === module || require.main?.filename.match(/__sapper__\/build\/index.js$/)

const createSapperAndApolloServer = async (graphqlPath = "/graphql"): Promise<Express> => {
  const app = express()

  const apolloServer = await createApolloServer()

  apolloServer.applyMiddleware({ app, path: graphqlPath })

  if (main) {
    app.use(sirv("static", { dev }))
  }

  app.use(
    compression({ threshold: 0 }),
    cookieParser(),
    bodyParser.json(),
    async (req, res, next) => {
      try {
        const { token } = req.cookies
        const decodedClaims = await fbAdmin.auth().verifyIdToken(token, true)
        user.set({
          name: decodedClaims.name || null,
          photo: decodedClaims.picture || null,
          email: decodedClaims.email || null,
          emailVerified: decodedClaims.email_verified || null,
        })
      } catch {} // eslint-disable-line no-empty

      next()
    },
    sapper.middleware({
      session: () => ({
        user: get(user),
      }),
    }),
  )

  return app
}

if (main) {
  createSapperAndApolloServer("/graphql").then(app => {
		app.listen(PORT, (err?: any): void => { // eslint-disable-line
      if (err) console.log("error", err)
    })
  })
}

export { createSapperAndApolloServer }

// For more Cloud Functions, write and export them here
// and import and set them up in `/index.js`
