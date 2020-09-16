import Model, { Props } from "./Model"

class Post {
  static collection = "posts"

  public id?: string
  public slug: string
  public title: string
  public html: string

  constructor(params: Props<Post>) {
    this.slug = params.slug
    this.title = params.title
    this.html = params.html
  }
}

export default class extends Model(Post) {}
