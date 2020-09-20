import type { Props } from "./Model"
import Model from "./MM"

export default class Post extends Model {
  static collection = "posts"

  public id?: string
  public slug: string
  public title: string
  public html: string

  constructor(params: Props<Post>) {
    super(params)
    this.slug = params.slug
    this.title = params.title
    this.html = params.html
  }
}
