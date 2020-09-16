import type { Readable } from "svelte/store"
import { kebabCase } from "lodash-es"
import Model, { Props, ExtendedModel } from "./Model"
import Author from "./Author"
import Comment from "./Comment"

class Article {
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _comments?: Readable<Comment[]>

  get comments(): Readable<Comment[]> {
    if (!this.id) throw Error("Article needs to be saved before you can add comments.")
    /* eslint-disable no-underscore-dangle */
    if (!this._comments) {
      this._comments = Comment.query().where("article", "==", (this as any).docRef)
    }
    // eslint-disable-next-line no-underscore-dangle
    return this._comments
  }

  constructor(init: Pick<Props<Article>, "id"|"title"|"body"|"tagList"|"description"|"author"> & {slug?: string}) {
    this.id = init.id
    this.slug = init.slug || kebabCase(init.title)
    this.title = init.title
    this.body = init.body
    this.tagList = init.tagList
    this.description = init.description
    this.author = init.author ? new Author(init.author) : undefined
  }

  async addComment(params: Pick<Props<Comment>, "body"|"author">): Promise<Comment> {
    if (!this.id) await (this as unknown as ExtendedModel<Article>).save()
    const comment = new Comment({ ...params, article: this as any })
    await comment.save()
    return comment
  }
}

export default class extends Model(Article) {}
