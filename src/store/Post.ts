import Model, { InitParams } from "./Model"

class Post {
  static collection = "posts"

  public slug: string
  public title: string
  public html: string

  constructor(params: InitParams<Post>) {
    this.slug = params.slug
    this.title = params.title
    this.html = params.html
  }
}

export default class extends Model(Post) {}
