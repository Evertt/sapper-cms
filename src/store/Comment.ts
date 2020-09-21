// import type { Readable } from "svelte/store"
import User from "./User"
import Model, { belongsTo, ModelQuery } from "./Model"

export default class Comment extends Model {
  static collection = "comments"

  public body: string
  public createdAt: Date = new Date()

  @belongsTo(User) public author: ModelQuery<User>

  constructor(init: { body: string, author: User, createdAt?: Date }) {
    super(init)

    this.body = init.body
    this.author = init.author as any
    this.createdAt = init.createdAt || new Date()
  }
}