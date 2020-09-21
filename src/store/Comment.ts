// import type { Readable } from "svelte/store"
import User from "./User"
import type { Props } from "./Model"
import Model, {
  belongsTo,
  DocQueryWrapper,
} from "./MM"

export default class Comment extends Model {
  static collection = "comments"

  public id?: string
  public body: string
  public createdAt: Date = new Date()

  @belongsTo(User) public author: DocQueryWrapper<User>

  constructor(params: Omit<Props<Comment>, "createdAt">) {
    super(params)
    this.id = params.id
    this.body = params.body
    this.author = params.author
  }
}
