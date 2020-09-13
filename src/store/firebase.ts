import type FBClient from "firebase"
import type FBAdmin from "firebase-admin"

let firebase: typeof FBClient | typeof FBAdmin
let firebaseConfig: any

if (process.browser) {
  firebase = window.firebase
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
if ((db as any).enablePersistence) (db as any).enablePersistence()
