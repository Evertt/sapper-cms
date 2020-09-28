import Model, { Props } from "rxfirestorm"

export default class User extends Model {
  static collection = "users"

  public email = ""
  public displayName = ""
  public token = ""
  public username = ""
  public image = ""
  public bio = ""
  public emailVerified = false
  public following = false

  constructor(init: Partial<Props<User>>) {
    super(init)
    Object.assign(this, init)
  }
}
