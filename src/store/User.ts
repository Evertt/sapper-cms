import Model, { Props } from "./Model"

class User {
  static collection = "users"

  public id?: string
  public email?: string|null
  public name?: string|null
  public token?: string
  public username?: string|null
  public image?: string|null
  public bio?: string|null
  public emailVerified?: boolean

  public createdAt?: Date
  public updatedAt?: Date

  constructor(params: Props<User>) {
    Object.assign(this, params)
  }
}

export default class extends Model(User) {}
