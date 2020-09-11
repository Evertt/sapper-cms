import type FBClient from "firebase"
import type FBAdmin from "firebase-admin"

let firebase: typeof FBClient | typeof FBAdmin
let firebaseConfig: any

if (process.browser) {
  firebase = window.firebase

  firebaseConfig = {
    apiKey: "AIzaSyA1KyA-IPdV18EbhjVwtCs_DiACWI_l3po",
    authDomain: "mytryout-246d2.firebaseapp.com",
    databaseURL: "https://mytryout-246d2.firebaseio.com",
    projectId: "mytryout-246d2",
    storageBucket: "mytryout-246d2.appspot.com",
    messagingSenderId: "283873800239",
    appId: "1:283873800239:web:aee2367ae33287cf07d6da",
  }
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
