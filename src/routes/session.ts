import type { Request as ExpressRequest, Response as ExpressResponse } from "express"
import { fbAdmin } from "../store/firebase"

const createNewFirebaseSession = async (idToken: string): Promise<string> => {
  // Set session expiration to 2 weeks.
  const expiresIn = 1000 * 60 * 60 * 24 * 14

  // To only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a session cookie.
  return fbAdmin.auth().createSessionCookie(idToken, { expiresIn })
}

export const put = async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
  const oldSession = req.session!.public
  const newSession = req.body
  const newIdToken = newSession.user?.idToken

  if (newIdToken == null) {
    delete req.session!.firebaseSessionCookie
  } else if (newIdToken !== oldSession?.user?.idToken) {
    try {
      req.session!.firebaseSessionCookie = await createNewFirebaseSession(newIdToken)
      req.session!.firebaseIdToken = newIdToken
    } catch (error) {
      res.status(401).json({ message: "The user id token was invalid." })
    }
  }

  req.session!.public = req.body
  res.status(204).end()
}
