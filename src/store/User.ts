import { writable } from "svelte/store"

export interface User {
  name: string|null
  photo: string|null
  email: string|null
  emailVerified: boolean|null
}

const user = writable(null as User|null)

export default user
