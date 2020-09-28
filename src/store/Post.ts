import Model, { Props } from "rxfirestorm"

export default class Post extends Model {
  static collection = "posts"

  public slug = ""
  public title = ""
  public html = ""

  constructor(init: Partial<Props<Post>>) {
    super(init)
    Object.assign(this, init)
  }
}
