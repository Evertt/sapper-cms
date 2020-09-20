import type { Props } from "./Model"
import Model from "./MM"

export default class User extends Model {
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
    super(params)
    Object.assign(this, params)
  }
}
