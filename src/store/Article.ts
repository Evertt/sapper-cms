import { kebabCase } from "lodash-es"
import type { Props } from "./Model"
import Model, { subcollection, ColQueryWrapper } from "./MM"
import Author from "./Author"
import type User from "./User"
import Comment from "./Comment"

export default class Article extends Model {
  static collection = "articles"

  public id?: string
  public slug: string
  public title: string
  public body: string
  public tagList: string[]
  public description: string
  public favorited = false
  public favoritesCount = 0
  public author?: Author
  public createdAt: Date = new Date()

  @subcollection(Comment) public comments!: ColQueryWrapper<Comment>

  constructor(init: Pick<Props<Article>, "id"|"title"|"body"|"tagList"|"description"|"author"> & {slug?: string}) {
    super(init)
    this.id = init.id
    this.slug = init.slug || kebabCase(init.title)
    this.title = init.title
    this.body = init.body
    this.tagList = init.tagList
    this.description = init.description
    this.author = init.author ? new Author(init.author) : undefined
  }

  async addComment(comment: { body: string, author: User }): Promise<void> {
    await this.comments.add(comment)
  }
}
