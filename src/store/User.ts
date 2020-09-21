import Model, { Props } from "./Model"

export default class User extends Model {
  static collection = "users"

  public email?: string|null
  public name?: string|null
  public token?: string
  public username?: string|null
  public image?: string|null
  public bio?: string|null
  public emailVerified?: boolean
  public following = false

  public createdAt?: Date
  public updatedAt?: Date

  constructor(params: Partial<Props<User>>) {
    super(params)

    Object.assign(this, params)
  }
}
