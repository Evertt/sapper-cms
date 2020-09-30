import Model, { BelongsTo, ModelQuery } from "rxfirestorm"
import User from "./User"

export default class Comment extends Model {
  static collection = "comments"

  @BelongsTo(User)
  public author: ModelQuery<typeof User>
  public body: string

  constructor(init: { body: string, author: User }) {
    super(init)

    this.body = init.body
    this.author = init.author as any
  }
}
