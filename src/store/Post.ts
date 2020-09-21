import Model, { Props } from "./Model"

export default class Post extends Model {
  static collection = "posts"

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
