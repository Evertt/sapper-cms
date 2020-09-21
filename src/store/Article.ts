import { kebabCase } from "lodash-es"
import type { Props } from "./Model"
import Model, {
  belongsTo,
  subcollection,
  DocQueryWrapper,
  ColQueryWrapper,
} from "./MM"
import User from "./User"
import Comment from "./Comment"

export default class Article extends Model {
  static collection = "articless"

  public id?: string
  public slug: string
  public title: string
  public body: string
  public tagList: string[]
  public description: string
  public favorited: boolean
  public favoritesCount: number
  public createdAt: Date

  @belongsTo(User) public author: DocQueryWrapper<User>
  @subcollection(Comment) public comments!: ColQueryWrapper<Comment>

  constructor(init: Partial<Props<Article>>) {
    super(init)
    this.id = init.id
    this.slug = init.slug || kebabCase(init.title)
    this.title = init.title || ""
    this.body = init.body || ""
    this.tagList = init.tagList || []
    this.description = init.description || ""
    this.author = init.author!
    this.favorited = init.favorited || false
    this.favoritesCount = init.favoritesCount || 0
    this.createdAt = init.createdAt || new Date()
  }

  async addComment(comment: { body: string, author: User }): Promise<void> {
    await this.comments.add(comment as any)
  }

  setSlug(): void {
    this.slug = kebabCase(this.title)
  }
}
