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

  public slug = ""
  public title = ""
  public body = ""
  public tagList: string[] = []
  public description = ""
  public favorited = false
  public favoritesCount = 0

  @belongsTo(User) public author: ModelQuery<typeof User>
  @subcollection(Comment) public comments!: CollectionQuery<typeof Comment>

  constructor(init: PropsRequired<Article, "author">) {
    super(init)
    Object.assign(this, init)
    this.author = init.author
  }

  async addComment(comment: { body: string, author: User }): Promise<void> {
    await this.comments.add(comment)
  }

  setSlug(): void {
    this.slug = kebabCase(this.title)
  }
}
