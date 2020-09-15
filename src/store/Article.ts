import type { Readable } from "svelte/store"
import { readable } from "svelte/store"
import Model, { InitParams, ExtendedModel } from "./Model"
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
  public favorited: boolean
  public favoritesCount: number
  public author: Author
  public createdAt: Date = new Date()

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _comments?: Readable<Comment[]>

  get comments(): Readable<Comment[]> {
    if (!this.id) throw Error("Article needs to be saved before you can add comments.")
    // eslint-disable-next-line no-underscore-dangle
    if (!this._comments) this._comments = Comment.query().where("articleId", "==", this.id)
    // eslint-disable-next-line no-underscore-dangle
    return this._comments
  }

  constructor(params: InitParams<Article>) {
    this.id = params.id
    this.slug = params.slug
    this.title = params.title
    this.body = params.body
    this.tagList = params.tagList
    this.description = params.description
    this.favorited = params.favorited
    this.favoritesCount = params.favoritesCount
    this.author = new Author(params.author)
  }

  async addComment(params: Omit<InitParams<Comment>, "articleId">): Promise<Comment> {
    if (!this.id) await (this as unknown as ExtendedModel<Article>).save()
    const comment = new Comment({ ...params, articleId: this.id! })
    await comment.save()
    return comment
  }
}

export default class extends Model(Article) {}
