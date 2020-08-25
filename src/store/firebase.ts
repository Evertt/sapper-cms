import type Firebase from "firebase-admin"

let fb
let firebaseConfig

if (process.browser) {
  fb = window.firebase
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
  // eslint-disable-next-line global-require
  fb = require("firebase-admin")
  firebaseConfig = process.env.FIREBASE_ADMIN_AUTH

  if (typeof firebaseConfig === "string") {
    firebaseConfig = JSON.parse(firebaseConfig)
  }

  if (firebaseConfig != null) {
    firebaseConfig = {
      credential: fb.credential.cert(firebaseConfig),
      databaseURL: "https://mytryout-246d2.firebaseio.com",
    }
  }
}

const app: Firebase.app.App = fb.initializeApp(firebaseConfig)

export const db = app.firestore()
if ((db as any).enablePersistence) (db as any).enablePersistence()
