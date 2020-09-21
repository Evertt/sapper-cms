import Model, { Props } from "./Model"

export default class User extends Model {
  static collection = "users"

  public email?: string|null
  public displayName?: string|null
  public token?: string
  public username?: string|null
  public image?: string|null
  public bio?: string|null
  public emailVerified?: boolean
  public following = false

  public createdAt: Date
  public updatedAt: Date

  constructor(params: Partial<Props<User>>) {
    super(params)

    Object.assign(this, params)

    if (!params.createdAt) {
      this.createdAt = new Date()
    } else if (typeof params.createdAt === "string") {
      this.createdAt = new Date(params.createdAt)
    } else {
      this.createdAt = params.createdAt
    }

    if (!params.updatedAt) {
      this.updatedAt = new Date()
    } else if (typeof params.updatedAt === "string") {
      this.updatedAt = new Date(params.updatedAt)
    } else {
      this.updatedAt = params.updatedAt
    }
  }
}
