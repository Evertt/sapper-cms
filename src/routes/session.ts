import type { Request as ExpressRequest, Response as ExpressResponse } from "express"
import { fbAdmin } from "../store/firebase"

type Request = ExpressRequest & {
  session: {
    public?: string
    firebaseIdToken?: string
    firebaseSessionCookie?: string
  }
}

const createNewFirebaseSession = async (idToken: string): Promise<string> => {
  // Set session expiration to 2 weeks.
  const expiresIn = 1000 * 60 * 60 * 24 * 14

  // To only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a session cookie.
  return fbAdmin.auth().createSessionCookie(idToken, { expiresIn })
}

export const put = async (req: Request, res: ExpressResponse): Promise<void> => {
  const newSession = req.body
  const newIdToken = newSession.user?.idToken

  if (newIdToken == null) {
    delete req.session.firebaseIdToken
    delete req.session.firebaseSessionCookie
  } else if (newIdToken !== req.session.firebaseIdToken) {
    try {
      req.session.firebaseSessionCookie = await createNewFirebaseSession(newIdToken)
      req.session.firebaseIdToken = newIdToken
    } catch (error) {
      res.status(401).json({ message: "The user id token was invalid." })
    }
  }

  req.session.public = req.body
  res.status(204).end()
}
