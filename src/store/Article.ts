import { kebabCase } from "lodash-es"
import Model, {
  PropsRequired,
  belongsTo,
  subcollection,
  ModelQuery,
  CollectionQuery,
} from "./Model"
import User from "./User"
import Comment from "./Comment"

export default class Article extends Model {
  static collection = "articless"

  public slug: string
  public title: string
  public body: string
  public tagList: string[]
  public description: string
  public favorited: boolean
  public favoritesCount: number
  public createdAt: Date

  @belongsTo(User) public author: ModelQuery<User>
  @subcollection(Comment) public comments!: CollectionQuery<typeof Comment>

  constructor(init: PropsRequired<Article, "author">) {
    super(init)

    this.slug = init.slug || ""
    this.title = init.title || ""
    this.body = init.body || ""
    this.tagList = init.tagList || []
    this.description = init.description || ""
    this.author = init.author
    this.favorited = init.favorited || false
    this.favoritesCount = init.favoritesCount || 0
    this.createdAt = init.createdAt || new Date()
  }

  async addComment(comment: { body: string, author: User }): Promise<void> {
    await this.comments.add(comment)
  }

  setSlug(): void {
    this.slug = kebabCase(this.title)
  }
}
