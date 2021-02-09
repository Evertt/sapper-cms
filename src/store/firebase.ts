import type FBClient from "firebase"
import type FBAdmin from "firebase-admin"
import { init as initFireStorm } from "rxfirestorm"

let firebase: typeof FBClient | typeof FBAdmin
let firebaseConfig: any

if (process.browser) {
  firebase = window.firebase as any as typeof FBClient
  firebaseConfig = process.env.FIREBASE_BROWSER_CONFIG
} else {
  // eslint-disable-next-line
  firebase = require("firebase-admin") as typeof FBAdmin

  firebaseConfig = {
    credential: firebase.credential.applicationDefault(),
    databaseURL: "https://mytryout-246d2.firebaseio.com",
  }
}

const app = firebase.initializeApp(firebaseConfig)
export const fbAdmin = app as FBAdmin.app.App
export const fbClient = app as FBClient.app.App

export const db = app.firestore()
if ("enablePersistence" in db) {
  db.enablePersistence({ synchronizeTabs: true })
}

export const { serverTimestamp } = firebase.firestore.FieldValue

initFireStorm(db, serverTimestamp)
