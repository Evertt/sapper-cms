// import type { Readable } from "svelte/store"
import Model, { Props } from "./Model"
import type Article from "./Article"
import type Author from "./Author"

class Comment {
  static collection = "comments"

  public id?: string
  public author: Author
  public body: string
  public article: Article
  public createdAt: Date = new Date()

  constructor(params: Omit<Props<Comment>, "createdAt">) {
    this.id = params.id
    this.body = params.body
    this.author = params.author
    this.article = params.article
  }
}

export default class extends Model(Comment) {}
