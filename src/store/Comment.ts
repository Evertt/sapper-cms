// import type { Readable } from "svelte/store"
import type User from "./User"
import type { Props } from "./Model"
import Model from "./MM"

export default class Comment extends Model {
  static collection = "comments"

  public id?: string
  public author: User
  public body: string
  public createdAt: Date = new Date()

  constructor(params: Omit<Props<Comment>, "createdAt">) {
    super(params)
    this.id = params.id
    this.body = params.body
    this.author = params.author
  }
}
