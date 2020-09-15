import Model, { InitParams } from "./Model"
import type Author from "./Author"

class Comment {
  static collection = "comments"

  public id?: string
  public author: Author
  public body: string
  public articleId: string
  public createdAt?: Date = new Date()

  constructor(params: InitParams<Comment>) {
    this.id = params.id
    this.author = params.author
    this.body = params.body
    this.articleId = params.articleId
  }
}

export default class extends Model(Comment) {}
